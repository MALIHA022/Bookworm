import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Navbar2 from '../components/navbar2';
import Sidebar from '../components/sidebar';
import PostCard from '../components/postcards';

import './Dashboard.css';

const Wishlisted = () => {
  const [wishlistedPosts, setWishlistedPosts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('wishlisted'); // 'wishlisted' or 'messages'
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

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

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/users/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter only message notifications and group by conversation
        const messageNotifications = data.warnings.filter(n => n.type === 'message');
        setConversations(messageNotifications);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchWishlistedPosts();
    fetchConversations();
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

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowMessageModal(true);
    setReplyMessage('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'messages') {
      // Refresh conversations when switching to messages tab
      const fetchConversations = async () => {
        try {
          const token = localStorage.getItem('token');
          const { data } = await axios.get('http://localhost:5000/api/users/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const messageNotifications = data.warnings.filter(n => n.type === 'message');
          setConversations(messageNotifications);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      };
      fetchConversations();
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedConversation(null);
    setReplyMessage('');
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/message', {
        postId: selectedConversation.post,
        message: replyMessage,
        isReply: true,
        originalMessageId: selectedConversation._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReplyMessage('');
      alert('Message sent successfully!');
      
      // Refresh conversations
      const { data } = await axios.get('http://localhost:5000/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messageNotifications = data.warnings.filter(n => n.type === 'message');
      setConversations(messageNotifications);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div>
        <Navbar2 />
        <Sidebar />
      <div className="dashboard-container">
        <div className="toggle">
          <button 
            className={`toggle-btn ${activeTab === 'wishlisted' ? 'active' : ''}`}
            onClick={() => handleTabChange('wishlisted')}
          >
            Wishlisted Posts
          </button>
          <button 
            className={`toggle-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            💬 Messages
          </button>
        </div>

        {/* Wishlisted Posts Tab */}
        {activeTab === 'wishlisted' && (
          <div className='wishlist'>
          <div className="explore-section">
          <h2>Wishlisted Posts</h2>
            <div className='posts-list'>
              {wishlistedPosts.length === 0 ? (
                <p className='no-posts'>No wishlisted posts yet.</p>
              ) : (
                wishlistedPosts.map(post => (
                  <div key={post._id}>
                    <div className='wishlist-card'>
                        <div className='wishlist-card-header'>
                            <span className={`pill pill-${post.type}`}>{post.type}</span>
                            <h4> {post.user.firstName} {post.user.lastName}</h4>
                          </div>

                        <div className='wishlist-card-body'>
                          <div className='card-title'>
                            <h3>Book Title: {post.title || post.bookTitle}</h3>
                          </div>
                          <div className='card-author'>
                              <p><strong>Author:</strong> {post.author}</p>
                          </div>

                          <div className='card-content'>
                              <p>"{post.content || post.description}"</p>
                          </div>
                        </div>  
                        <div className="contact-section">
                          <button 
                          className="contact-btn"
                          onClick={() => handleContact(post)}
                          >📧 Message {post.user.firstName} {post.user.lastName}
                          </button>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-section">
            <h2>Messages</h2>
            <div className='messages-list'>
              {conversations.length === 0 ? (
                <p className='no-messages'>No messages yet.</p>
              ) : (
                conversations.map(conversation => (
                  <div 
                    key={conversation._id} 
                    className="conversation-item"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="conversation-icon">💬</div>
                      <div className="conversation-content">
                       {conversation.senderName && (
                         <div className="conversation-sender">
                           From: {conversation.senderName}
                         </div>
                       )}
                       <div className="conversation-preview">
                         {conversation.message.substring(0, 50)}...
                       </div>
                       <div className="conversation-time">
                         {new Date(conversation.at).toLocaleDateString()}
                       </div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact User Modal */}
      {showContactModal && selectedPost && (
        <div className="contact-modal-overlay">
          <div className="contact-modal-content">
              <button className="close-modal" onClick={closeContactModal}>❌</button>
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
              <p><strong>Message:</strong></p>
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

      {/* Message Modal To send Messages */}
      {showMessageModal && selectedConversation && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
              <span 
                className="close-modal"
                onClick={closeMessageModal}
              >❌
              </span>
            <div className="message-header">
               <h3>💬 Message</h3>
               {selectedConversation.senderName && (
                 <div className="message-sender">
                   From: {selectedConversation.senderName} ({selectedConversation.senderEmail})
                 </div>
               )}
               <span className="message-date">
                 {new Date(selectedConversation.at).toLocaleDateString()}
               </span>
             </div>
            
            {/* Post Details */}
            {selectedConversation.postTitle && (
              <div className="post-details">
                <h4>Post Details:</h4>
                <div className="post-info">
                  <p><strong>Type:</strong> {selectedConversation.postType}</p>
                  <p><strong>Title:</strong> {selectedConversation.postTitle}</p>
                  {selectedConversation.postAuthor && (
                    <p><strong>Author:</strong> {selectedConversation.postAuthor}</p>
                  )}
                  {selectedConversation.postDescription && (
                    <p><strong>Description:</strong> {selectedConversation.postDescription}</p>
                  )}
                  {selectedConversation.postPrice && (
                    <p><strong>Price:</strong> ${selectedConversation.postPrice}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="message-content">
              <h4>Message:</h4>
              <p>{selectedConversation.message}</p>
            </div>

            {/* Show original message for replies */}
            {selectedConversation.isReply && selectedConversation.originalMessage && (
              <div className="original-message-section">
                <h4>Original Message:</h4>
                <p className="original-message">{selectedConversation.originalMessage}</p>
              </div>
            )}

            {/* Reply Section */}
            <div className="reply-section">
              <h4>Send Message:</h4>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message..."
                rows="3"
                className="reply-textarea"
              />
              <button 
                className="send-message-btn"
                onClick={sendReply}
                disabled={!replyMessage.trim()}
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
