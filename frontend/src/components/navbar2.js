import React, { use, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')); 
  
  //logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page after logout
  };

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

            {/* Account Dropdown */}
            <div className="account-dropdown">
              <button className="icon" onClick={() => setShowDropdown(!showDropdown)}>👤 
                {user?.firstName || 'Account'}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <p>@{user?.firstName} {user?.lastName}</p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};

export default Navbar2;