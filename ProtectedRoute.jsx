import React from 'react';
import { useAuth } from '../AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { styles } from '../styles'; // For the loading style

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading screen while we check if the user is logged in
    return <div style={{...styles.quizContainer, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5em'}}>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect them to the homepage to log in
    return <Navigate to="/" replace />;
  }

  // If they are authenticated, render the child route (e.stg., <StartTest /> or <TestLayout />)
  return <Outlet />;
};

export default ProtectedRoute;
