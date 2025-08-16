import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Dashboard from './pages/Dashboard';
import UserSettings from './pages/UserSettings';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>  {/* Only one Router here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
