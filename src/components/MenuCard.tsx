import React from 'react';
import { Plus } from 'lucide-react';
import type { Dish } from '../types';

interface MenuCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
}

export function MenuCard({ dish, onAddToCart }: MenuCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200 hover:shadow-lg">
      <div className="relative h-48 sm:h-56">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{dish.name}</h3>
        <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{dish.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              currencyDisplay: 'narrowSymbol'
            }).format(dish.price).replace('XOF', 'Fr')}
          </span>
          <button
            onClick={() => onAddToCart(dish)}
            className="flex items-center justify-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="Ajouter au panier"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}