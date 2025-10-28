import { useState } from 'react';
import { Home } from '@/components/Home';
import { Services } from '@/components/Services';
import { Admin } from '@/components/Admin';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon name="Gamepad2" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              EasyAdventure
            </h1>
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`font-medium transition-all duration-200 flex items-center gap-2 ${
                currentPage === 'home' 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground hover:text-primary hover:scale-105'
              }`}
            >
              <Icon name="Home" size={18} />
              Главная
            </button>
            <button
              onClick={() => setCurrentPage('services')}
              className={`font-medium transition-all duration-200 flex items-center gap-2 ${
                currentPage === 'services' 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground hover:text-primary hover:scale-105'
              }`}
            >
              <Icon name="ShoppingBag" size={18} />
              Услуги
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`font-medium transition-all duration-200 flex items-center gap-2 ${
                currentPage === 'admin' 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground hover:text-primary hover:scale-105'
              }`}
            >
              <Icon name="Settings" size={18} />
              Админ-панель
            </button>
          </div>
        </div>
      </nav>
      
      <main className="pt-20">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'services' && <Services />}
        {currentPage === 'admin' && <Admin />}
      </main>
    </div>
  );
};

export default Index;