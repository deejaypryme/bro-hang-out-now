
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to home page for mobile-first experience
  return <Navigate to="/home" replace />;
};

export default Index;
