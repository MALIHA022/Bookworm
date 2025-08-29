import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Navbar2 from '../components/navbar2';
import Sidebar from '../components/sidebar';
import PostCard from '../components/postcards';

import './Wishlisted.css';

const Wishlisted = () => {
  const [wishlistedPosts, setWishlistedPosts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchWishlistedPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/posts/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistedPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching wishlisted posts:', error);
      }
    };

    fetchWishlistedPosts();
  }, []);

  useEffect(() => {
    const onWishlistChanged = (e) => {
      const { postId, wishlisted } = e.detail || {};
      if (wishlisted) {
        (async () => {
          try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/posts/wishlist', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistedPosts(data.posts || []);
          } catch (err) {
            console.error('Error refreshing wishlist:', err);
          }
        })();
      } else {
        setWishlistedPosts(prev => prev.filter(p => p._id !== postId));
      }
    };

    window.addEventListener('wishlist-changed', onWishlistChanged);
    return () => window.removeEventListener('wishlist-changed', onWishlistChanged);
  }, []);

  const handleContact = (post) => {
    setSelectedPost(post);
    setMessageText('');
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedPost(null);
    setMessageText('');
  };

  const sendMessage = async () => {
    try {
      if (!messageText.trim()) {
        alert('Please write a message');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to send messages');
        return;
      }
      await axios.post('http://localhost:5000/api/users/message', {
        postId: selectedPost._id,
        message: messageText.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Message sent');
      closeContactModal();
    } catch (err) {
      console.error('Failed to send message', err);
      alert(err?.response?.data?.error || 'Failed to send message');
    }
  };

  return (
    <div className='wishlist-grid'>
        <Navbar2 />
        <Sidebar />
      <div className="page-container">
          <div className="posts-section">
            <h2>Wishlisted Posts</h2>
            <div className='posts-list'>
              {wishlistedPosts.length === 0 ? (
                <p className='no-posts'>No wishlisted posts yet.</p>
              ) : (
                wishlistedPosts.map(post => (
                  <div key={post._id}>
                    <PostCard post={post} />
                    <div className="contact-section">
                      <button 
                      className="contact-btn"
                      onClick={() => handleContact(post)}
                      >
                      📧 Contact {post.user.firstName} {post.user.lastName}
                      </button>
                      </div>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>

          {showContactModal && selectedPost && (
            <div className="contact-modal-overlay">
              <div className="contact-modal-content">
                <button className="close-btn" onClick={closeContactModal}>❌</button>
                <h3>Contact Information</h3>
                <div className="contact-details">
                  <p><strong>Name:</strong> {selectedPost.user.firstName} {selectedPost.user.lastName}</p>
                  <p><strong>Email:</strong> {selectedPost.user.email}</p>
                  <p><strong>Post Type:</strong> {selectedPost.type}</p>
                  {selectedPost.type === 'sell' && (
                    <p><strong>Price:</strong> ${selectedPost.price}</p>
                  )}
                </div>
                <div className="contact-compose">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write your message here..."
                    rows="4"
                    className="contact-textarea"
                  />
                </div>
                <div className="contact-actions">
                  <button 
                    className="email-btn"
                    onClick={sendMessage}
                    >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default Wishlisted;
