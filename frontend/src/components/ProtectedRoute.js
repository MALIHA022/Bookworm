import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  // no token, redirect to the home page
  if (!token) {
    return <Navigate to="/home" />; 
  }
  
  return children;
};

export default ProtectedRoute;
