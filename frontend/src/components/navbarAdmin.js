import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './navbar.css';
import NotificationsAdmin from './NotificationsAdmin';

const NavbarAdmin = () => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);  
  const [modalOpen, setModalOpen] = useState(false);
  const [postType, setPostType] = useState('');  
  const [posts, setPosts] = useState([]);
  

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Error parsing user data:", err);
  }

  // Fetch posts 
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        setPosts(response.data);  
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Open modal with selected post type
  const openModal = (type) => {
    setPostType(type);  
    setModalOpen(true);  
  };

  const closeModal = () => {
    setModalOpen(false);
    setPostType('');
  };

  const toggleAccountDropdown = () => {
    setShowAccountDropdown(!showAccountDropdown);
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src='/logo.png' alt="BookWorm Logo" />
        <div className="navbar-title">BookWorm</div>
      </div>
      <div className="navbar-right">
      
        <div>
          <NotificationsAdmin />
        </div>

        {/* Account Dropdown */}
        <div className="account-dropdown">
          <button className="icon" onClick={toggleAccountDropdown}>
            👤 {user?.firstName || 'Account'}
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

export default NavbarAdmin;
