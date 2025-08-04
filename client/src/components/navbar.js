// Navbar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

const openmodal = () => {
  navigate('/create-post', { state: { backgroundLocation: location } });
};
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src='/logo.png' alt="BookWorm Logo" /> 
      <div className="navbar-title">BookWorm</div>
      </div>
      <div className="navbar-right">
        <input type="text" placeholder="Search books..." className="search-bar" />
        <button onClick={openmodal} className="plus-icon">➕</button>
          <span className="icon">🔔</span>
          <span className="icon">👤</span>
      </div>
    </div>
  );
};

export default Navbar;
