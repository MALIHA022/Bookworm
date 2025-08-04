// Navbar.js
import React from 'react';
import './navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="logo.png" alt="BookWorm Logo" />
      </div>
      <div className="navbar-right">
      <input type="text" placeholder="Search books..." className="search-bar" />
        <span className="icon">🔔</span>
        <span className="icon">👤</span>
      </div>
    </div>
  );
};

export default Navbar;
