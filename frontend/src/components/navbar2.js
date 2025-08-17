import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './navbar.css';
import CreateReview from './CreateReview';  // Review Post Modal
import CreateDonate from './CreateDonate';  // Donate Post Modal
import CreateSell from './CreateSell';  // Sell Post Modal
import './createpost.css'

const Navbar2 = () => {
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);  // State for plus icon dropdown
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);  // State for account dropdown
  const [modalOpen, setModalOpen] = useState(false);  // Track if modal is open
  const [postType, setPostType] = useState('');  // Track the post type (review, donate, sell)
  const [posts, setPosts] = useState([]);  // State to hold posts
  
  // Retrieve user info from localStorage
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Error parsing user data:", err);
  }

  // Fetch posts on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        setPosts(response.data);  // Set fetched posts to state
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page after logout
  };

  // Open modal with selected post type
  const openModal = (type) => {
    setPostType(type);  // Set the post type (review, donate, sell)
    setModalOpen(true);  // Open the modal
  };

  // Close the modal
  const closeModal = () => {
    setModalOpen(false);  // Close the modal
    setPostType('');  // Reset the post type
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

  // Handle post creation logic
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
      // Update dashboard state
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
        <div className="navbar-title">BookWorm</div>
      </div>
      <div className="navbar-right">
        <input type="text" placeholder="Search books..." className="search-bar" />
        
        {/* Dropdown for post options with review, donate, sell */}
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

        <span className="icon">🔔</span>

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

      {/* Render modal if it's open */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>❌</button>

            {/* Render the appropriate modal based on the selected post type */}
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
