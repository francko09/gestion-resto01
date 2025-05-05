/*
  # Initial Schema Setup

  1. New Tables (if not exist)
    - `profiles`
    - `dishes`
    - `orders`
    - `order_items`
  
  2. Security
    - Enable RLS
    - Add policies for each table
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Create profiles table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      username text UNIQUE NOT NULL,
      role text NOT NULL CHECK (role IN ('server', 'admin')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create dishes table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dishes') THEN
    CREATE TABLE dishes (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text NOT NULL,
      description text,
      price numeric NOT NULL CHECK (price >= 0),
      category text NOT NULL,
      image_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create orders table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    CREATE TABLE orders (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      table_number integer NOT NULL CHECK (table_number > 0),
      status text NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
      total numeric NOT NULL CHECK (total >= 0),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create order_items table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    CREATE TABLE order_items (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
      dish_id uuid REFERENCES dishes(id) ON DELETE RESTRICT,
      quantity integer NOT NULL CHECK (quantity > 0),
      price_at_time numeric NOT NULL CHECK (price_at_time >= 0),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on all tables
DO $$ 
BEGIN
  -- Enable RLS for each table
  EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE dishes ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE order_items ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

  -- Dishes policies
  DROP POLICY IF EXISTS "Dishes are viewable by everyone" ON dishes;
  DROP POLICY IF EXISTS "Only admins can insert dishes" ON dishes;
  DROP POLICY IF EXISTS "Only admins can update dishes" ON dishes;
  DROP POLICY IF EXISTS "Only admins can delete dishes" ON dishes;

  CREATE POLICY "Dishes are viewable by everyone"
    ON dishes FOR SELECT
    USING (true);

  CREATE POLICY "Only admins can insert dishes"
    ON dishes FOR INSERT
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ));

  CREATE POLICY "Only admins can update dishes"
    ON dishes FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ));

  CREATE POLICY "Only admins can delete dishes"
    ON dishes FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ));

  -- Orders policies
  DROP POLICY IF EXISTS "Orders are viewable by authenticated users" ON orders;
  DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
  DROP POLICY IF EXISTS "Servers and admins can update orders" ON orders;

  CREATE POLICY "Orders are viewable by authenticated users"
    ON orders FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    ));

  CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Servers and admins can update orders"
    ON orders FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('server', 'admin')
    ));

  -- Order items policies
  DROP POLICY IF EXISTS "Order items are viewable by authenticated users" ON order_items;
  DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

  CREATE POLICY "Order items are viewable by authenticated users"
    ON order_items FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
    ));

  CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Only staff can update order items"
    ON order_items FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'server')
    ));

  CREATE POLICY "Only admins can delete order items"
    ON order_items FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ));
END $$;

-- Create or replace function for handling updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
  -- Drop existing triggers first to avoid conflicts
  DROP TRIGGER IF EXISTS handle_updated_at_profiles ON profiles;
  DROP TRIGGER IF EXISTS handle_updated_at_dishes ON dishes;
  DROP TRIGGER IF EXISTS handle_updated_at_orders ON orders;

  -- Create new triggers
  CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

  CREATE TRIGGER handle_updated_at_dishes
    BEFORE UPDATE ON dishes
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

  CREATE TRIGGER handle_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();
END $$;