import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, Coffee, RotateCw } from 'lucide-react';
import type { Order, SupabaseOrder, SupabaseOrderItem } from '../types';
import { supabase } from '../lib/supabase';

export function ServerView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [servedOrdersAscending, setServedOrdersAscending] = useState(true);

  // Fonction pour trier les commandes
  const sortOrders = (ordersToSort: Order[]) => {
    return ordersToSort.sort((a, b) => {
      // Définir l'ordre de priorité des statuts
      const statusPriority = {
        'pending': 0,    // Commandes validées en premier
        'preparing': 1,  // Commandes en préparation ensuite
        'ready': 2,      // Commandes prêtes après
        'served': 3      // Commandes servies en dernier
      };

      // D'abord trier par statut
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Si même statut, trier par date
      if (a.status === 'served') {
        // Pour les commandes servies, utiliser l'ordre spécifié
        return servedOrdersAscending 
          ? a.timestamp.getTime() - b.timestamp.getTime()
          : b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        // Pour les autres commandes, toujours plus récent en premier
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });
  };

  // Fonction pour charger les commandes
  const loadOrders = async () => {
    try {
      console.log('Chargement des commandes...');
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items (
            *,
            dish:dishes (*)
          )
        `)
        .order('created_at', { ascending: true });

      if (ordersError) {
        console.error('Erreur lors du chargement des commandes:', ordersError);
        throw ordersError;
      }

      if (ordersData) {
        const formattedOrders = sortOrders((ordersData as SupabaseOrder[]).map(formatOrder));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater une commande
  const formatOrder = (order: SupabaseOrder): Order => {
    console.log('Ordre complet reçu de Supabase:', order);
    const timestamp = order.created_at ? new Date(order.created_at) : (
      order.updated_at ? new Date(order.updated_at) : new Date()
    );
    console.log('Timestamp utilisé:', timestamp);
    
    const formattedOrder = {
      id: order.id,
      tableNumber: order.table_number,
      status: order.status,
      timestamp,
      total: order.total,
      items: order.order_items.map((item: SupabaseOrderItem) => ({
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
    return formattedOrder;
  };

  useEffect(() => {
    // Charger les commandes initiales
    loadOrders();

    // Configurer la souscription en temps réel
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders'
        }, 
        async (payload) => {
          console.log('🔔 Nouvelle commande détectée:', payload);
          
          // Charger la nouvelle commande avec ses détails
          const { data: newOrder, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items:order_items (
                *,
                dish:dishes (*)
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Erreur lors du chargement de la nouvelle commande:', error);
            return;
          }

          if (newOrder) {
            // Formater la nouvelle commande
            const formattedOrder = formatOrder(newOrder as SupabaseOrder);
            
            // Ajouter la nouvelle commande et trier la liste
            setOrders(prevOrders => {
              const updatedOrders = [...prevOrders, formattedOrder];
              return updatedOrders.sort((a, b) => {
                // Définir l'ordre de priorité des statuts
                const statusPriority = {
                  'pending': 0,    // Commandes validées en premier
                  'preparing': 1,  // Commandes en préparation ensuite
                  'ready': 2,      // Commandes prêtes après
                  'served': 3      // Commandes servies en dernier
                };

                // D'abord trier par statut
                const statusDiff = statusPriority[a.status] - statusPriority[b.status];
                if (statusDiff !== 0) return statusDiff;

                // Si même statut, trier par date (plus récent en premier pour les commandes non servies)
                if (a.status === 'served') {
                  return a.timestamp.getTime() - b.timestamp.getTime(); // Plus ancien en premier pour les servies
                } else {
                  return b.timestamp.getTime() - a.timestamp.getTime(); // Plus récent en premier pour les autres
                }
              });
            });
            
            // Afficher une notification système
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouvelle Commande', {
                body: `Table ${formattedOrder.tableNumber} - ${formattedOrder.items.length} articles`,
                icon: '/icon.png'
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut de la souscription:', status);
      });

    // Demander la permission pour les notifications dès le chargement
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Permission notifications:', permission);
      });
    }

    // Nettoyer la souscription lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Mettre à jour l'état local
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut. Veuillez réessayer.');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'preparing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'ready':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'served':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'preparing':
        return <Coffee className="h-5 w-5" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5" />;
      case 'served':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Commandes</h1>
            <button
              onClick={() => {
                setLoading(true);
                loadOrders().then(() => setLoading(false));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <RotateCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Chargement...' : 'Rafraîchir'}
            </button>
            <button
              onClick={() => {
                setServedOrdersAscending(!servedOrdersAscending);
                setOrders(prevOrders => [...sortOrders(prevOrders)]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Commandes servies : {servedOrdersAscending ? 'Plus anciennes d\'abord' : 'Plus récentes d\'abord'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Table {order.tableNumber}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.timestamp.toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: 'Africa/Porto-Novo'
                    })}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.dish.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {item.quantity}x {item.dish.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        currencyDisplay: 'narrowSymbol'
                      }).format(item.dish.price * item.quantity).replace('XOF', 'Fr')}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      currencyDisplay: 'narrowSymbol'
                    }).format(order.total).replace('XOF', 'Fr')}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Préparer
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Prêt
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Servi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}