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
                    <div className="notification-icon">⚠️</div>
                    <div className="notification-content">
                      <div className="notification-title">Admin Warning</div>
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

      {/* Warning Modal */}
      {showWarningModal && selectedWarning && (
        <div className="warning-modal-overlay">
          <div className="warning-modal-content">
            <div className="warning-header">
              <h3>⚠️ Admin Warning</h3>
              <span className="warning-date">
                {new Date(selectedWarning.at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="warning-message">
              <p>{selectedWarning.message}</p>
            </div>

            <div className="warning-actions">
              <button 
                className="mark-read-btn"
                onClick={() => markAsRead(selectedWarning._id)}
              >
                Mark as Read
              </button>
              <button 
                className="close-btn"
                onClick={closeWarningModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
