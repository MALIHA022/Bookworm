import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './modal.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.get('http://localhost:5000/api/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data.warnings || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleWarningClick = (warning) => {
    setSelectedWarning(warning);
    setShowWarningModal(true);
    setShowDropdown(false);
  };

  const markAsRead = async (warningId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/notifications/${warningId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from notifications list
      setNotifications(prev => prev.filter(n => n._id !== warningId));
      setShowWarningModal(false);
      setSelectedWarning(null);
    } catch (error) {
      console.error('Error marking warning as read:', error);
    }
  };



  const closeWarningModal = () => {
    setShowWarningModal(false);
    setSelectedWarning(null);
  };

  const getNotificationIcon = (type, isReply) => {
    if (type === 'message') {
      return isReply ? '↩️' : '💬';
    }
    return '⚠️';
  };

  const getNotificationTitle = (type, isReply) => {
    if (type === 'message') {
      return 'Message from User';
    }
    return 'Admin Warning';
  };

  const getPostDetails = (notification) => {
    if (!notification.postTitle) return null;
    
    return (
      <div className="post-details">
        <h4>Post Details:</h4>
        <div className="post-info">
          <p><strong>Type:</strong> {notification.postType}</p>
          <p><strong>Title:</strong> {notification.postTitle}</p>
          {notification.postAuthor && (
            <p><strong>Author:</strong> {notification.postAuthor}</p>
          )}
          {notification.postDescription && (
            <p><strong>Description:</strong> {notification.postDescription}</p>
          )}
          {notification.postPrice && (
            <p><strong>Price:</strong> ${notification.postPrice}</p>
          )}
        </div>
      </div>
    );
  };

  const unreadCount = notifications.length;

  return (
    <>
      <div className="notifications-container">
        <button 
          className="navbar-btn"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notifications-dropdown">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className="notification-item"
                    onClick={() => handleWarningClick(notification)}
                  >
                                         <div className="notification-icon">
                       {getNotificationIcon(notification.type, notification.isReply)}
                     </div>
                     <div className="notification-content">
                       <div className="notification-title">
                         {getNotificationTitle(notification.type)}
                       </div>
                       {notification.senderName && (
                         <div className="notification-sender">
                           From: {notification.senderName}
                         </div>
                       )}
                      <div className="notification-preview">
                        {notification.message.substring(0, 50)}...
                      </div>
                      <div className="notification-time">
                        {new Date(notification.at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showWarningModal && selectedWarning && (
        <div className="warning-modal-overlay">
          <div className="warning-modal-content">
            <span 
                className="close-modal"
                onClick={closeWarningModal}
              >
                ❌
              </span>
              <div className="warning-header">
               <h3>
                 {getNotificationIcon(selectedWarning.type, selectedWarning.isReply)} {getNotificationTitle(selectedWarning.type)}
               </h3>
               {selectedWarning.senderName && (
                 <div className="warning-sender">
                   From: {selectedWarning.senderName} ({selectedWarning.senderEmail})
                 </div>
               )}
              <span className="warning-date">
                {new Date(selectedWarning.at).toLocaleDateString()}
              </span>
            </div>
            
            {/* Post Details */}
            {getPostDetails(selectedWarning)}
            
            <div className="warning-message">
              <h4>Message:</h4>
              <p>{selectedWarning.message}</p>
            </div>

            {/* Show original message for replies */}
            {selectedWarning.type === 'message' && selectedWarning.isReply && selectedWarning.originalMessage && (
              <div className="original-message-section">
                <h4>Original Message:</h4>
                <p className="original-message">{selectedWarning.originalMessage}</p>
              </div>
            )}

            <div className="warning-actions">
              <button 
                className="mark-read-btn"
                onClick={() => markAsRead(selectedWarning._id)}
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
