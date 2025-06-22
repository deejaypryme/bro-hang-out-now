
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, Zap, Users } from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/bro-mode', icon: Zap, label: 'Bro Mode' },
    { path: '/friends', icon: Users, label: 'Friends' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-surface border-t border-white/20 z-50 md:hidden shadow-2xl">
      <div className="flex items-center justify-around h-16 px-bro-md">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                touch-target flex flex-col items-center justify-center min-w-0 flex-1 py-bro-xs px-bro-xs rounded-bro-lg transition-all duration-300
                ${isActive 
                  ? 'text-accent-orange bg-accent-orange/10 scale-105 shadow-lg' 
                  : 'text-text-secondary hover:text-accent-orange hover:bg-white/10 hover:scale-102'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-bro-xs" />
              <span className="typo-mono text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
