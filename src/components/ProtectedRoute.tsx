
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log('🔒 [ProtectedRoute] Checking authentication...');
  
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔒 [ProtectedRoute] Auth state:', { hasUser: !!user, loading });

  if (loading) {
    console.log('🔒 [ProtectedRoute] Still loading, showing loading screen...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white mx-auto mb-4 animate-pulse">
            👊
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 [ProtectedRoute] No user found, redirecting to login...');
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🔒 [ProtectedRoute] User authenticated, rendering children...');
  return <>{children}</>;
};

export default ProtectedRoute;
