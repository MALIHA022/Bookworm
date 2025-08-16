import React, { use, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPlusDropdown, setShowPlusDropdown] = useState(false);  // State for plus icon dropdown
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);  // State for account dropdown
  const user = JSON.parse(localStorage.getItem('user')); 
  
  //logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page after logout
  };

  const openmodal = (type) => {
    navigate('/createpost', { state: { backgroundLocation: location , postType: type} });
  };

  // Toggle plus icon dropdown
  const togglePlusDropdown = () => {
    setShowPlusDropdown(!showPlusDropdown);
    setShowAccountDropdown(false);  // Close account dropdown when plus icon is clicked
  };

  // Toggle account dropdown
  const toggleAccountDropdown = () => {
    setShowAccountDropdown(!showAccountDropdown);
    setShowPlusDropdown(false);  // Close plus icon dropdown when account dropdown is clicked
  };

  return (
        <div className="navbar">
          <div className="navbar-logo">
            <img src='/logo.png' alt="BookWorm Logo" />
            <div className="navbar-title">BookWorm</div>
          </div>
          <div className="navbar-right">
            <input type="text" placeholder="Search books..." className="search-bar" />
            {/** Dropdown for post options with review, donate, sell */}
            <div className="plus-icon-dropdown">
              <button className="plus-icon" onClick={togglePlusDropdown}>➕</button>
              {showPlusDropdown && (
                <div className="dropdown-menu-plus">
                  <button onClick={() => openmodal('review')}>Review</button>
                  <button onClick={() => openmodal('donate')}>Donate</button>
                  <button onClick={() => openmodal('sell')}>Sell</button>
                </div>
              )}
            </div>
            <span className="icon">🔔</span>

            {/* Account Dropdown */}
            <div className="account-dropdown">
              <button className="icon" onClick={toggleAccountDropdown}>👤
                {user?.firstName || 'Account'}
              </button>
              {showAccountDropdown && (
                <div className="dropdown-menu">
                  <p>@{user?.firstName} {user?.lastName}</p>
                  <button className='buttons' onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
 
  );
};

export default Navbar2;