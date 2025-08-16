import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute component to ensure only logged-in users access
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  // If there's no token, redirect the user to the login page
  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if no token
  }
  
  return children;
};

export default ProtectedRoute;
