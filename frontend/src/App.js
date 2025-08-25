import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserSettings from './pages/UserSettings';
import Bookmarks from './pages/Bookmarks';
import Wishlisted from './pages/Wishlisted';
import Explore from './pages/Explore';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/navbar2';
import AdminRoute from './components/adminRoute'

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
      </Routes>
    </Router>
  );
};

export default App;
