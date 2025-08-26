import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Dashboard from './pages/Dashboard';
import UserSettings from './pages/UserSettings';
import Bookmarks from './pages/Bookmarks';
import Wishlisted from './pages/Wishlisted';
import Explore from './pages/Explore';


import AdminRoute from './components/adminRoute'
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPosts from './pages/AdminPosts';

import './App.css'; 




const App = () => {
  return (
    <Router>  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/usersettings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlisted /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />

        <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/users/admin" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/posts/admin" element={<AdminRoute><AdminPosts /></AdminRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
