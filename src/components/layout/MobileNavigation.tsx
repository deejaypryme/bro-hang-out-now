
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
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-custom z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-muted hover:text-primary'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
