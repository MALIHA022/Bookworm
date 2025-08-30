import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Notifications from './Notifications';
import axios from 'axios';

import './navbar.css';
import CreateReview from './CreateReview'; 
import CreateDonate from './CreateDonate'; 
import CreateSell from './CreateSell';  
import './createpost.css'

const Navbar2 = () => {
  const navigate = useNavigate();
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);  
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

  // fetch posts
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

  const togglePlusDropdown = () => {
    setShowPlusDropdown(!showPlusDropdown);
    setShowAccountDropdown(false);  
  };

  const toggleAccountDropdown = () => {
    setShowAccountDropdown(!showAccountDropdown);
    setShowPlusDropdown(false);
  };

  const handlePostCreation = async (postData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a post.');
      return;
    } 

    try {
      const response = await axios.post(
        'http://localhost:5000/api/posts/create',
        postData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev => [response.data, ...prev]);
      alert('Post created successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create post');
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src='/logo.png' alt="BookWorm Logo" />
        <div className="navbar-title">
          <Link to="/dashboard">BookWorm</Link>
        </div>
      </div>
      <div className="navbar-right">
        <div className="plus-icon-dropdown">
          <button className="plus-icon" onClick={togglePlusDropdown}>➕</button>
          {showPlusDropdown && (
            <div className="dropdown-menu-plus">
              <button onClick={() => openModal('review')}>Review</button>
              <button onClick={() => openModal('donate')}>Donate</button>
              <button onClick={() => openModal('sell')}>Sell</button>
            </div>
          )}
        </div>
        <div>
          <Notifications />
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

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>❌</button>

            {postType === 'review' && <CreateReview onPost={handlePostCreation} onClose={closeModal} />}
            {postType === 'donate' && <CreateDonate onPost={handlePostCreation} onClose={closeModal} />}
            {postType === 'sell' && <CreateSell onPost={handlePostCreation} onClose={closeModal} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar2;
