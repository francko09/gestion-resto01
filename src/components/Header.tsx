import React, { useState } from 'react';
import { Menu, ShoppingCart, User, LogOut, ClipboardList, ArrowLeft, Moon, Sun, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

interface HeaderProps {
  onCartClick: () => void;
  onServerViewClick?: () => void;
  onBackToMenu?: () => void;
  onPageChange?: (page: 'menu' | 'about' | 'reviews') => void;
  currentPage?: 'menu' | 'about' | 'reviews';
}

export function Header({ 
  onCartClick, 
  onServerViewClick, 
  onBackToMenu,
  onPageChange,
  currentPage = 'menu'
}: HeaderProps) {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePageChange = (page: 'menu' | 'about' | 'reviews') => {
    if (onPageChange) {
      onPageChange(page);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              {onBackToMenu ? (
                <button
                  onClick={onBackToMenu}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                  <span className="font-medium hidden sm:inline">Retour au Menu</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMenu}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Menu"
                  >
                    {isMenuOpen ? (
                      <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">Le Restaurant</h1>
                </>
              )}
            </div>
            
            {!onBackToMenu && onPageChange && (
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => handlePageChange('menu')}
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors
                            ${currentPage === 'menu' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                >
                  Menu
                </button>
                <button
                  onClick={() => handlePageChange('about')}
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors
                            ${currentPage === 'about' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                >
                  À propos
                </button>
                <button
                  onClick={() => handlePageChange('reviews')}
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors
                            ${currentPage === 'reviews' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                >
                  Avis
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onCartClick}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Panier"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
                {onServerViewClick && (
                  <button
                    onClick={onServerViewClick}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span className="hidden sm:inline">Vue Serveur</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu déroulant mobile */}
        {isMenuOpen && !onBackToMenu && onPageChange && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border-t dark:border-gray-700">
            <nav className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => handlePageChange('menu')}
                className={`text-left px-4 py-2 rounded-lg transition-colors
                          ${currentPage === 'menu'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
              >
                Menu
              </button>
              <button
                onClick={() => handlePageChange('about')}
                className={`text-left px-4 py-2 rounded-lg transition-colors
                          ${currentPage === 'about'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
              >
                À propos
              </button>
              <button
                onClick={() => handlePageChange('reviews')}
                className={`text-left px-4 py-2 rounded-lg transition-colors
                          ${currentPage === 'reviews'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
              >
                Avis
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}