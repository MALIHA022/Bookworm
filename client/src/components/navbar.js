// Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="logo.png" alt="BookWorm Logo" />
      </div>
      <div className="navbar-right">
      <input type="text" placeholder="Search books..." className="search-bar" />
      <button onClick={() => navigate('/create-post')} className="plus-icon">
        ➕
      </button>
        <span className="icon">🔔</span>
        <span className="icon">👤</span>
      </div>
    </div>
  );
};

export default Navbar;
