import React, { useState } from 'react';
import { Header } from './components/Header';
import { MenuPage } from './pages/MenuPage';
import { AboutPage } from './pages/AboutPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { Cart } from './components/Cart';
import { ServerView } from './pages/ServerView';
import { AdminView } from './pages/AdminView';
import { LoginPage } from './pages/LoginPage';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'menu' | 'about' | 'reviews'>('menu');
  const [isServerView, setIsServerView] = useState(false);
  const { user } = useAuth();

  if (isServerView) {
    if (!user) {
      return <LoginPage />;
    }
    
    if (user.role === 'admin') {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Header 
            onCartClick={() => setIsCartOpen(true)} 
            onBackToMenu={() => setIsServerView(false)}
            onPageChange={setCurrentPage}
            currentPage={currentPage}
          />
          <AdminView />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header 
          onCartClick={() => setIsCartOpen(true)} 
          onBackToMenu={() => setIsServerView(false)}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
        />
        <ServerView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
        onServerViewClick={() => setIsServerView(true)}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
      />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {currentPage === 'menu' && <MenuPage />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'reviews' && <ReviewsPage />}
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}
export default App;
