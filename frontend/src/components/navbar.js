// home page navbar
// src/components/Navbar.js

import "./navbar.css";
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  return (
    // <nav style={{ padding: '10px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <nav className="navbar">
       <div className="navbar-logo">
         <img src='/logo.png' alt="BookWorm Logo" />
       <div className="navbar-title">BookWorm</div>
       </div>
      <div className="navbar-right">
        <button onClick={onLoginClick}>Login</button>
        <button onClick={onRegisterClick}>Register</button>
      </div>
    </nav>
  );
};

export default Navbar;



