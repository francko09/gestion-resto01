export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  timestamp: Date;
  total: number;
}

export interface SupabaseOrder {
  id: string;
  table_number: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  total: number;
  created_at: string;
  updated_at: string;
  order_items: SupabaseOrderItem[];
}

export interface SupabaseOrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  updated_at: string;
  dish: SupabaseDish;
}

export interface SupabaseDish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}