
import React from 'react';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Main content with bottom padding for mobile nav */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Layout;
