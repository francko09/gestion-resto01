import React, { useState, useEffect, useMemo } from 'react';
import { MenuCard } from '../components/MenuCard';
import { SearchBar } from '../components/SearchBar';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import type { Dish } from '../types';

export function MenuPage() {
  const { addItem } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDishes() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Erreur lors du chargement des plats depuis Supabase:', error);
          const savedDishes = localStorage.getItem('dishes');
          if (savedDishes) {
            setDishes(JSON.parse(savedDishes));
          }
        } else {
          const formattedDishes: Dish[] = data.map(dish => ({
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            category: dish.category,
            imageUrl: dish.image_url
          }));
          
          setDishes(formattedDishes);
          localStorage.setItem('dishes', JSON.stringify(formattedDishes));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des plats:', err);
        const savedDishes = localStorage.getItem('dishes');
        if (savedDishes) {
          setDishes(JSON.parse(savedDishes));
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDishes();
  }, []);

  // Filtrer les plats en fonction de la recherche
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;

    const query = searchQuery.toLowerCase().trim();
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query)
    );
  }, [dishes, searchQuery]);

  // Grouper les plats filtrés par catégorie
  const dishesByCategory = filteredDishes.reduce((acc, dish) => {
    const category = dish.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  // Traduction des catégories
  const categoryTranslations: Record<string, string> = {
    'Main Course': 'Plats Principaux',
    'Starter': 'Entrées',
    'Dessert': 'Desserts',
    'Beverage': 'Boissons'
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Notre Menu
      </h1>

      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher un plat par nom ou description..."
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {dishes.length === 0 
              ? "Aucun plat disponible pour le moment."
              : "Aucun plat ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(dishesByCategory).map(([category, categoryDishes]) => (
            <section key={category} id={category.toLowerCase()} className="scroll-mt-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-blue-500">
                {categoryTranslations[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryDishes.map((dish) => (
                  <MenuCard
                    key={dish.id}
                    dish={dish}
                    onAddToCart={addItem}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}