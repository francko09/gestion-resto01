import React, { useState, useEffect } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderSteps } from './OrderSteps';
import type { Order, SupabaseOrder } from '../types';
import { supabase } from '../lib/supabase';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [tableNumber, setTableNumber] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convertir le statut de la commande en numéro d'étape
  const getStepFromStatus = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'served': return 4;
      default: return 0;
    }
  };

  // Vérifier périodiquement le statut de la commande
  useEffect(() => {
    if (!currentOrder) return;

    // Vérifier le statut initial
    const checkOrderStatus = async () => {
      try {
        const { data: orderData, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items (
              *,
              dish:dishes (*)
            )
          `)
          .eq('id', currentOrder.id)
          .single();

        if (error) {
          console.error('Erreur lors de la vérification du statut:', error);
          return;
        }

        if (orderData) {
          const supabaseOrder = orderData as SupabaseOrder;
          const updatedOrder: Order = {
            id: supabaseOrder.id,
            tableNumber: supabaseOrder.table_number,
            status: supabaseOrder.status,
            timestamp: new Date(supabaseOrder.created_at),
            total: supabaseOrder.total,
            items: supabaseOrder.order_items.map(item => ({
              quantity: item.quantity,
              dish: {
                id: item.dish.id,
                name: item.dish.name,
                description: item.dish.description,
                price: item.price_at_time || item.dish.price,
                category: item.dish.category,
                imageUrl: item.dish.image_url
              }
            }))
          };

          setCurrentOrder(updatedOrder);
          
          // Si la commande est servie, réinitialiser après un délai et rafraîchir la page
          if (updatedOrder.status === 'served') {
            setTimeout(() => {
              setCurrentOrder(null);
              clearCart();
              onClose();
              // Rafraîchir la page
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    // Vérifier le statut initial
    checkOrderStatus();

    // Mettre en place la souscription aux changements
    const orderSubscription = supabase
      .channel(`order-${currentOrder.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrder.id}`
        }, 
        () => {
          checkOrderStatus();
        }
      )
      .subscribe();

    // Nettoyer la souscription
    return () => {
      orderSubscription.unsubscribe();
    };
  }, [currentOrder, clearCart, onClose]);

  const handleSubmitOrder = async () => {
    if (!tableNumber) {
      alert('Veuillez entrer un numéro de table');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Créer d'abord la commande simple
      console.log('Création de la commande...');
      const now = new Date();
      const orderToCreate = {
        table_number: parseInt(tableNumber),
        status: 'pending',
        total: state.total,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };
      console.log('Données de la commande à créer:', orderToCreate);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderToCreate)
        .select('*, order_items(*)') // Sélectionner tous les champs après l'insertion
        .single();

      if (orderError) {
        console.error('Erreur Supabase (création commande):', orderError);
        throw orderError;
      }

      console.log('Commande créée avec succès:', orderData);

      // 2. Créer ensuite les éléments de la commande
      console.log('Création des éléments de la commande...');
      const orderItems = state.items.map(item => ({
        order_id: orderData.id,
        dish_id: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price
      }));
      console.log('Éléments à créer:', orderItems);

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('Erreur Supabase (création items):', itemsError);
        // En cas d'erreur, on essaie de supprimer la commande
        await supabase.from('orders').delete().eq('id', orderData.id);
        throw itemsError;
      }

      console.log('Éléments créés avec succès:', itemsData);

      // 3. Créer l'objet pour l'état local
      const order: Order = {
        id: orderData.id,
        tableNumber: orderData.table_number,
        items: state.items,
        status: 'pending',
        timestamp: new Date(orderData.created_at),
        total: orderData.total
      };

      console.log('Commande complète créée:', order);
      setCurrentOrder(order);
      
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Code d\'erreur:', error.code);
      alert(`Erreur lors de la création de la commande: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transition-colors duration-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Votre Panier</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={!!currentOrder}
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <OrderSteps currentStep={currentOrder ? getStepFromStatus(currentOrder.status) : 0} />

          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">Votre panier est vide</p>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex items-center space-x-4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                  >
                    <img
                      src={item.dish.imageUrl}
                      alt={item.dish.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.dish.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          currencyDisplay: 'narrowSymbol'
                        }).format(item.dish.price * item.quantity).replace('XOF', 'Fr')}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.dish.id, Math.max(0, item.quantity - 1))}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          disabled={!!currentOrder}
                        >
                          <Minus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          disabled={!!currentOrder}
                        >
                          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.dish.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                      disabled={!!currentOrder}
                    >
                      <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="mb-4">
              <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de table
              </label>
              <input
                type="number"
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         transition-colors"
                placeholder="Entrez le numéro de table"
                min="1"
                disabled={!!currentOrder}
              />
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  currencyDisplay: 'narrowSymbol'
                }).format(state.total).replace('XOF', 'Fr')}
              </span>
            </div>
            {currentOrder ? (
              <div className="text-center text-gray-600 dark:text-gray-300">
                {currentOrder.status === 'pending' && "Commande en attente de préparation..."}
                {currentOrder.status === 'preparing' && "Votre commande est en cours de préparation"}
                {currentOrder.status === 'ready' && "Votre commande est prête !"}
                {currentOrder.status === 'served' && "Bon appétit !"}
              </div>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={state.items.length === 0 || !tableNumber || isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                  disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? 'Envoi de la commande...' : 'Commander'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}