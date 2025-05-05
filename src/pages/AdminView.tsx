import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, FileText, Printer, Calendar, ChevronDown, QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Dish, Order, SupabaseOrder, SupabaseOrderItem } from '../types';
import { supabase } from '../lib/supabase';

interface DishFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const initialFormData: DishFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'Main Course',
  imageUrl: '',
};

interface EditDishModalProps {
  dish?: Dish;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: DishFormData) => void;
}

function EditDishModal({ dish, isOpen, onClose, onSave }: EditDishModalProps) {
  const [formData, setFormData] = useState<DishFormData>(dish || initialFormData);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        imageUrl: dish.imageUrl,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [dish, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {dish ? 'Modifier le plat' : 'Ajouter un plat'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-blue-500 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-blue-500 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       transition-colors duration-200"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-blue-500 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-blue-500 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       transition-colors duration-200"
            >
              <option value="Main Course">Plat Principal</option>
              <option value="Starter">Entrée</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Boisson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL de l'image</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-blue-500 focus:ring-blue-500 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       transition-colors duration-200"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                       transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors duration-200"
            >
              {dish ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  ordersByCategory: Record<string, number>;
  popularDishes: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByDate: Record<string, { orders: Order[]; totalRevenue: number; totalOrders: number }>;
}

interface OrderStats {
  totalRevenue: number;
  dishStats: Record<string, {
    quantity: number;
    revenue: number;
  }>;
  ordersByCategory: Record<string, number>;
}

const categoryNames: Record<string, string> = {
  'Main Course': 'Plat Principal',
  'Starter': 'Entrée',
  'Dessert': 'Dessert',
  'Beverage': 'Boisson'
};

function ReportSection() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOrdersByDateExpanded, setIsOrdersByDateExpanded] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let startDate: Date;
      let endDate: Date;

      // Définir les dates en UTC directement
      switch (reportType) {
        case 'daily':
          startDate = new Date();
          startDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            0, 0, 0, 0
          ));
          endDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            23, 59, 59, 999
          ));
          break;
        
        case 'monthly':
          startDate = new Date();
          startDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            1,
            0, 0, 0, 0
          ));
          endDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            0,
            23, 59, 59, 999
          ));
          break;

        case 'weekly':
          startDate = new Date();
          startDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() - 6,
            0, 0, 0, 0
          ));
          endDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 6,
            23, 59, 59, 999
          ));
          break;

        case 'custom':
          if (!customStartDate || !customEndDate) {
            setError('Veuillez sélectionner une période complète');
            setLoading(false);
            return;
          }
          startDate = new Date(customStartDate);
          startDate = new Date(Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            0, 0, 0, 0
          ));
          endDate = new Date(customEndDate);
          endDate = new Date(Date.UTC(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23, 59, 59, 999
          ));
          break;
      }

      const startDateUTC = startDate.toISOString();
      const endDateUTC = endDate.toISOString();

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items (
            *,
            dish:dishes (*)
          )
        `)
        .eq('status', 'served')
        .gte('created_at', startDateUTC)
        .lte('created_at', endDateUTC)
        .order('created_at', { ascending: true });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData) {
        throw new Error('Aucune donnée reçue');
      }

      const formattedOrders = (ordersData as SupabaseOrder[]).map(order => ({
        id: order.id,
        tableNumber: order.table_number,
        status: order.status,
        timestamp: new Date(order.created_at),
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
      }));

      setOrders(formattedOrders);
      await generateReportData(formattedOrders);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors du chargement des données.');
      setLoading(false);
    }
  };

  const generateReportData = useCallback(async (servedOrders: Order[] = orders) => {
    try {
      setLoading(true);

      if (servedOrders.length === 0) {
        setReport({
          totalOrders: 0,
          totalRevenue: 0,
          ordersByCategory: {},
          popularDishes: [],
          ordersByDate: {}
        });
        setLoading(false);
        return;
      }

      // Grouper les commandes par date
      const ordersByDate = servedOrders.reduce((acc, order) => {
        const date = order.timestamp.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        if (!acc[date]) {
          acc[date] = {
            orders: [],
            totalRevenue: 0,
            totalOrders: 0
          };
        }
        
        acc[date].orders.push(order);
        acc[date].totalRevenue += order.total;
        acc[date].totalOrders += 1;
        
        return acc;
      }, {} as Record<string, { orders: Order[], totalRevenue: number, totalOrders: number }>);

      const stats = servedOrders.reduce<OrderStats>((acc, order) => {
        order.items.forEach(item => {
          const dishKey = item.dish.name;
          if (!acc.dishStats[dishKey]) {
            acc.dishStats[dishKey] = { quantity: 0, revenue: 0 };
          }
          acc.dishStats[dishKey].quantity += item.quantity;
          const itemRevenue = item.quantity * item.dish.price;
          acc.dishStats[dishKey].revenue += itemRevenue;
          acc.totalRevenue += itemRevenue;

          const categoryName = categoryNames[item.dish.category] || item.dish.category;
          acc.ordersByCategory[categoryName] = (acc.ordersByCategory[categoryName] || 0) + item.quantity;
        });
        return acc;
      }, {
        totalRevenue: 0,
        dishStats: {},
        ordersByCategory: {}
      });

      const popularDishes = Object.entries(stats.dishStats)
        .map(([name, stats]) => ({
          name,
          quantity: stats.quantity,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const newReport = {
        totalOrders: servedOrders.length,
        totalRevenue: stats.totalRevenue,
        ordersByCategory: stats.ordersByCategory,
        popularDishes,
        ordersByDate
      };

      setReport(newReport);
      setLoading(false);
    } catch (error) {
      setError('Une erreur est survenue lors de la génération du rapport.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reportType !== 'custom') {
      loadOrders();
    } else {
      setReport(null);
    }
  }, [reportType]);

  useEffect(() => {
    if (orders.length > 0) {
      generateReportData(orders);
    }
  }, [orders, generateReportData]);

  useEffect(() => {
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders'
        }, 
        async (payload) => {
          if (
            (payload.eventType === 'UPDATE' && payload.new.status === 'served') ||
            payload.eventType === 'INSERT' ||
            payload.eventType === 'DELETE'
          ) {
            await loadOrders();
          }
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [reportType]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !report) return;

    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    switch (reportType) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'weekly':
        startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        endDate.setDate(startDate.getDate() + 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'monthly':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getPeriodTitle = () => {
      switch (reportType) {
        case 'daily':
          return 'Journalier';
        case 'weekly':
          return 'Hebdomadaire';
        case 'monthly':
          return 'Mensuel';
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport ${getPeriodTitle()} - ${formatDate(now)}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              max-width: 1000px;
              margin: 0 auto;
            }
            h1 { 
              color: #1a365d;
              text-align: center;
              margin-bottom: 30px;
            }
            .section { 
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              background: white;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #1a365d;
              color: white;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .period {
              font-size: 1.1em;
              color: #4a5568;
              margin: 10px 0;
              text-align: center;
            }
            .total {
              font-size: 1.2em;
              font-weight: bold;
              color: #1a365d;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport ${getPeriodTitle()}</h1>
            <div class="period">
              <p>Période : ${formatDate(startDate)} - ${formatDate(endDate)}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Résumé des Ventes</h2>
            <p class="total">Nombre total de commandes: ${report.totalOrders}</p>
            <p class="total">Chiffre d'affaires total: ${new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              currencyDisplay: 'narrowSymbol'
            }).format(report.totalRevenue).replace('XOF', 'Fr')}</p>
          </div>

          <div class="section">
            <h2>Top 5 des Plats les Plus Vendus</h2>
            <table>
              <thead>
                <tr>
                  <th>Plat</th>
                  <th>Quantité vendue</th>
                  <th>Chiffre d'affaires</th>
                  <th>% du CA total</th>
                </tr>
              </thead>
              <tbody>
                ${report.popularDishes.map(dish => `
                  <tr>
                    <td>${dish.name}</td>
                    <td>${dish.quantity}</td>
                    <td>${new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      currencyDisplay: 'narrowSymbol'
                    }).format(dish.revenue).replace('XOF', 'Fr')}</td>
                    <td>${((dish.revenue / report.totalRevenue) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Répartition des Ventes par Catégorie</h2>
            <table>
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Quantité vendue</th>
                  <th>% des ventes totales</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(report.ordersByCategory).map(([category, quantity]) => `
                  <tr>
                    <td>${category}</td>
                    <td>${quantity}</td>
                    <td>${((quantity / Object.values(report.ordersByCategory).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Informations Complémentaires</h2>
            <p>Rapport généré le ${formatDate(now)} à ${now.toLocaleTimeString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Rapports et Statistiques
          </h3>
          <ChevronDown 
            className={`ml-2 h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      <div className={`mt-6 transition-all duration-200 ${isExpanded ? 'block' : 'hidden'}`}>
        {error ? (
          <div className="text-red-600 dark:text-red-400 mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de Rapport
                </label>
                <div className="relative">
                  <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom');
                      if (e.target.value !== 'custom') {
                        loadOrders();
                      }
                    }}
                    className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 
                             focus:border-blue-500 block w-full p-2.5 pr-8"
                    disabled={loading}
                  >
                    <option value="daily">Rapport Journalier (aujourd'hui)</option>
                    <option value="weekly">Rapport Hebdomadaire (7 derniers jours)</option>
                    <option value="monthly">Rapport Mensuel (mois en cours)</option>
                    <option value="custom">Période Personnalisée</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {reportType === 'custom' && (
                <div className="flex-1 min-w-[300px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sélectionner la Période
                    <span className="text-sm text-gray-500 ml-2">(Les deux dates sont requises)</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label htmlFor="startDate" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date de début</label>
                      <input
                        id="startDate"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => {
                          setCustomStartDate(e.target.value);
                          setError(null);
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 
                                 focus:border-blue-500 p-2.5"
                        max={customEndDate || undefined}
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 pt-6">à</span>
                    <div className="flex-1">
                      <label htmlFor="endDate" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date de fin</label>
                      <input
                        id="endDate"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => {
                          setCustomEndDate(e.target.value);
                          setError(null);
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 
                                 focus:border-blue-500 p-2.5"
                        min={customStartDate || undefined}
                      />
                    </div>
                  </div>
                  {(reportType === 'custom' && (!customStartDate || !customEndDate)) && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      {!customStartDate && !customEndDate 
                        ? "Veuillez sélectionner une date de début et une date de fin"
                        : !customStartDate 
                          ? "Veuillez sélectionner une date de début"
                          : "Veuillez sélectionner une date de fin"}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadOrders();
                  }}
                  disabled={loading || (reportType === 'custom' && (!customStartDate || !customEndDate))}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md 
                           hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed h-[42px]"
                >
                  <FileText className="h-5 w-5" />
                  <span>{loading ? 'Génération...' : 'Générer'}</span>
                </button>

                {report && !loading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrint();
                    }}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md 
                             hover:bg-green-700 transition-colors h-[42px]"
                  >
                    <Printer className="h-5 w-5" />
                    <span>Imprimer</span>
                  </button>
                )}
              </div>
            </div>

            {report && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Commandes Totales
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.totalOrders}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Chiffre d'Affaires
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        currencyDisplay: 'narrowSymbol'
                      }).format(report.totalRevenue).replace('XOF', 'Fr')}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Plat le Plus Vendu
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.popularDishes[0]?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Commandes par Date
                    </h4>
                    <button
                      onClick={() => setIsOrdersByDateExpanded(!isOrdersByDateExpanded)}
                      className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ChevronDown 
                        className={`h-5 w-5 transform transition-transform duration-200 ${
                          isOrdersByDateExpanded ? 'rotate-180' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm">
                        {isOrdersByDateExpanded ? 'Réduire' : 'Développer'}
                      </span>
                    </button>
                  </div>
                  <div className={`space-y-6 transition-all duration-200 ${isOrdersByDateExpanded ? 'block' : 'hidden'}`}>
                    {Object.entries(report.ordersByDate)
                      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                      .map(([date, data]) => (
                        <div key={date} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-medium text-gray-900 dark:text-white">{date}</h5>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {data.totalOrders} commande{data.totalOrders > 1 ? 's' : ''} • 
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'XOF',
                                currencyDisplay: 'narrowSymbol'
                              }).format(data.totalRevenue).replace('XOF', 'Fr')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {data.orders.map(order => (
                              <div key={order.id} className="bg-white dark:bg-gray-800 rounded p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      Table {order.tableNumber}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {order.timestamp.toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('fr-FR', {
                                      style: 'currency',
                                      currency: 'XOF',
                                      currencyDisplay: 'narrowSymbol'
                                    }).format(order.total).replace('XOF', 'Fr')}
                                  </p>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                  {order.items.map(item => (
                                    <div key={item.dish.id} className="flex justify-between">
                                      <span>{item.quantity}x {item.dish.name}</span>
                                      <span>
                                        {new Intl.NumberFormat('fr-FR', {
                                          style: 'currency',
                                          currency: 'XOF',
                                          currencyDisplay: 'narrowSymbol'
                                        }).format(item.dish.price * item.quantity).replace('XOF', 'Fr')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Top 5 des Plats
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Plat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Quantité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Revenus
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {report.popularDishes.map((dish, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {dish.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {dish.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'XOF',
                                  currencyDisplay: 'narrowSymbol'
                                }).format(dish.revenue).replace('XOF', 'Fr')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Ventes par Catégorie
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Catégorie
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Quantité
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {Object.entries(report.ordersByCategory).map(([category, quantity], index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QRCodeSection() {
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <QrCode className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Générateur de QR Code
          </h3>
          <ChevronDown 
            className={`ml-2 h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      <div className={`mt-6 transition-all duration-200 ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texte ou URL pour le QR Code
            </label>
            <input
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              placeholder="Entrez le texte ou l'URL à encoder"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taille du QR Code: {qrSize}x{qrSize}
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col items-center space-y-4">
            {qrValue && (
              <>
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    id="qr-code"
                    value={qrValue}
                    size={qrSize}
                    level="H"
                    includeMargin
                    className="mx-auto"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md 
                           hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Télécharger le QR Code</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminView() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les plats depuis Supabase
  useEffect(() => {
    async function fetchDishes() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        // Transformer les données pour correspondre à notre format Dish
        const formattedDishes: Dish[] = data.map(dish => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          imageUrl: dish.image_url
        }));
        
        setDishes(formattedDishes);
        
        // Mettre à jour le localStorage pour la compatibilité avec le reste de l'application
        localStorage.setItem('dishes', JSON.stringify(formattedDishes));
      } catch (err) {
        console.error('Erreur lors du chargement des plats:', err);
        setError('Impossible de charger les plats. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDishes();
  }, []);

  const handleAddDish = async (formData: DishFormData) => {
    try {
      setError(null);
      
      // Insérer le plat dans Supabase
      const { data, error } = await supabase
        .from('dishes')
        .insert({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          image_url: formData.imageUrl
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Créer un nouvel objet Dish avec les données retournées
      const newDish: Dish = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url
      };
      
      // Mettre à jour l'état local
      const updatedDishes = [...dishes, newDish];
      setDishes(updatedDishes);
      
      // Mettre à jour le localStorage
      localStorage.setItem('dishes', JSON.stringify(updatedDishes));
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout du plat:', err);
      setError('Impossible d\'ajouter le plat. Veuillez réessayer plus tard.');
    }
  };

  const handleEditDish = async (formData: DishFormData) => {
    if (!editingDish) return;
    
    try {
      setError(null);
      
      // Mettre à jour le plat dans Supabase
      const { error } = await supabase
        .from('dishes')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          image_url: formData.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDish.id);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour l'état local
      const updatedDishes = dishes.map((dish) =>
        dish.id === editingDish.id 
          ? { 
              ...dish, 
              name: formData.name,
              description: formData.description,
              price: formData.price,
              category: formData.category,
              imageUrl: formData.imageUrl
            } 
          : dish
      );
      
      setDishes(updatedDishes);
      
      // Mettre à jour le localStorage
      localStorage.setItem('dishes', JSON.stringify(updatedDishes));
      
    } catch (err) {
      console.error('Erreur lors de la modification du plat:', err);
      setError('Impossible de modifier le plat. Veuillez réessayer plus tard.');
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      try {
        setError(null);
        
        // Supprimer le plat de Supabase
        const { error } = await supabase
          .from('dishes')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Mettre à jour l'état local
        const updatedDishes = dishes.filter((dish) => dish.id !== id);
        setDishes(updatedDishes);
        
        // Mettre à jour le localStorage
        localStorage.setItem('dishes', JSON.stringify(updatedDishes));
        
      } catch (err) {
        console.error('Erreur lors de la suppression du plat:', err);
        setError('Impossible de supprimer le plat. Veuillez réessayer plus tard.');
      }
    }
  };

  const openEditModal = (dish?: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportSection />
      <QRCodeSection />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du Menu</h2>
        <button
          onClick={() => openEditModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un plat</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md p-6 text-center transition-colors duration-200">
          <p className="text-gray-500 dark:text-gray-400">Aucun plat disponible. Ajoutez votre premier plat !</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md transition-colors duration-200">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {dishes.map((dish) => (
              <li key={dish.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{dish.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{dish.description}</p>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            currencyDisplay: 'narrowSymbol'
                          }).format(dish.price).replace('XOF', 'Fr')}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">• {dish.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(dish)}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-2 text-red-400 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <EditDishModal
        dish={editingDish}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDish(undefined);
        }}
        onSave={editingDish ? handleEditDish : handleAddDish}
      />
    </div>
  );
}