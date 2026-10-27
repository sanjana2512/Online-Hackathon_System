import React from 'react';
import { useAuth } from '../AuthContext'; // Import useAuth to get user info
import { Navigate, Outlet, useLocation } from 'react-router-dom'; // Import Navigate and Outlet

// This component wraps routes that should only be accessible by admin users.
// It assumes that the user is already authenticated (checked by ProtectedRoute).
const AdminRoute = () => {
  // Get the current user object and loading status from AuthContext
  const { user, isLoading } = useAuth();
  const location = useLocation(); // Get current location for potential redirects

  // Show a loading indicator while authentication status is being determined
  if (isLoading) {
    return (
       <div className="flex justify-center items-center h-screen font-sans text-lg bg-gray-100 text-gray-700">
          Verifying admin access...
       </div>
     );
  }

  // Check if the user exists and if their isAdmin flag is true
  if (user && user.isAdmin) {
    // If the user is an admin, render the child route component
    return <Outlet />;
  } else {
    // If the user is not an admin (or user data isn't loaded correctly),
    // redirect them to the homepage.
    console.warn("AdminRoute: Access denied. User is not an admin or user data is missing.");
    // Pass the original intended location in state, although homepage might not use it
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

export default AdminRoute;

