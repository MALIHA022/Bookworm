// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './modal.css';

// const NotificationsAdmin = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showWarningModal, setShowWarningModal] = useState(false);
//   const [selectedWarning, setSelectedWarning] = useState(null);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       const { data } = await axios.get('http://localhost:5000/api/users/notifications', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setNotifications(data.warnings || []);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     }
//   };

//   const handleWarningClick = (warning) => {
//     setSelectedWarning(warning);
//     setShowWarningModal(true);
//     setShowDropdown(false);
//   };

//   const markAsRead = async (warningId) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`http://localhost:5000/api/users/notifications/${warningId}/read`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       // Remove from notifications list
//       setNotifications(prev => prev.filter(n => n._id !== warningId));
//       setShowWarningModal(false);
//       setSelectedWarning(null);
//     } catch (error) {
//       console.error('Error marking warning as read:', error);
//     }
//   };

//   const closeWarningModal = () => {
//     setShowWarningModal(false);
//     setSelectedWarning(null);
//   };


//   const getNotificationTitle = (type, isReply) => {
//     if (type === 'activation_request') {
//       return 'Activation Request';
//     }
//   };

//   const getPostDetails = (notification) => {
//     if (!notification.postTitle) return null;
//   };

//   const unreadCount = notifications.length;

//   return (
//     <>
//       <div className="notifications-container">
//         <button 
//           className="navbar-btn"
//           onClick={() => setShowDropdown(!showDropdown)}
//         >
//           🔔
//           {unreadCount > 0 && (
//             <span className="notification-badge">{unreadCount}</span>
//           )}
//         </button>

//         {showDropdown && (
//           <div className="notifications-dropdown">
//             {notifications.length === 0 ? (
//               <div className="no-notifications">
//                 <p>No new notifications</p>
//               </div>
//             ) : (
//               <div className="notifications-list">
//                 {notifications.map((notification) => (
//                   <div 
//                     key={notification._id} 
//                     className="notification-item"
//                     onClick={() => handleWarningClick(notification)}
//                   >
//                      <div className="notification-content">
//                        <div className="notification-title">
//                          {getNotificationTitle(notification.type)}
//                        </div>
//                        {notification.senderName && (
//                          <div className="notification-sender">
//                            From: {notification.senderName}
//                          </div>
//                        )}
//                       <div className="notification-preview">
//                         {notification.message.substring(0, 50)}...
//                       </div>
//                       <div className="notification-time">
//                         {new Date(notification.at).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Notification Modal */}
//       {showWarningModal && selectedWarning && (
//         <div className="warning-modal-overlay">
//           <div className="warning-modal-content">
//             <div className="warning-header">
//                <h3>
//                  {getNotificationTitle(selectedWarning.type)}
//                </h3>
//                {selectedWarning.senderName && (
//                  <div className="warning-sender">
//                    Account Activation Request from: {selectedWarning.senderName} ({selectedWarning.senderEmail})
//                  </div>
//                )}
//               <span className="warning-date">
//                 {new Date(selectedWarning.at).toLocaleDateString()}
//               </span>
//             </div>

//             <div className="warning-actions">
//               <button 
//                 className="mark-read-btn"
//                 onClick={() => markAsRead(selectedWarning._id)}
//               >
//                 Mark as Read
//               </button>
//               <button 
//                 className="close-btn"
//                 onClick={closeWarningModal}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default NotificationsAdmin;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './modal.css';

const NotificationsAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem('token');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifications = useCallback(async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(
        'http://localhost:5000/api/admin/notifications?unread=true',
        auth
      );
      // Normalize id + safe defaults
      const list = (data?.notifications || []).map(n => ({
        ...n,
        id: n.id || n._id,                                   // <— normalize ID
        at: n.at || n.createdAt || null,
        userName: n.userName || '',
        userEmail: n.userEmail || '',
        message: n.message || '',
        type: n.type || 'notification',
      }));
      setNotifications(list);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const onClickNotification = (n) => {
    setSelected(n);
    setShowModal(true);
    setShowDropdown(false);
  };

  const markAsRead = async (id) => {
    try {
      if (!id) {
        console.error('markAsRead called without a valid id');
        return;
      }
      await axios.patch(
        `http://localhost:5000/api/admin/notifications/${id}/read`,
        {},
        auth
      );
      // Optimistically remove from list
      setNotifications(prev => prev.filter(n => n.id !== id));
      setShowModal(false);
      setSelected(null);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const getTitle = (type) => {
    switch (type) {
      case 'activation_request':
        return 'Account activation requested';
      default:
        return 'Notification';
    }
  };

  const unreadCount = notifications.length;

  return (
    <>
      <div className="notifications-container">
        <button
          className="navbar-btn"
          onClick={() => setShowDropdown(v => !v)}
          aria-label="Notifications"
          title="Notifications"
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
                {notifications.map((n) => (
                  <div
                    key={n.id}                                         
                    className="notification-item"
                    onClick={() => onClickNotification(n)}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {getTitle(n.type)}
                      </div>

                      {(n.userName || n.userEmail) && (
                        <div className="notification-sender">
                          From: {n.userName ? n.userName : n.userEmail}
                          {n.userName && n.userEmail ? ` (${n.userEmail})` : ''}
                        </div>
                      )}

                      {n.message && (
                        <div className="notification-preview">
                          {n.message.length > 80 ? `${n.message.slice(0, 80)}…` : n.message}
                        </div>
                      )}

                      <div className="notification-time">
                        {(() => {
                          try {
                            return new Date(n.at || Date.now()).toLocaleString();
                          } catch {
                            return '';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selected && (
        <div className="warning-modal-overlay" onClick={closeModal}>
          <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="warning-header">
              <h3>{getTitle(selected.type)}</h3>
              {(selected.userName || selected.userEmail) && (
                <div className="warning-sender">
                  {selected.userEmail
                    ? `${selected.userEmail} requested account activation.`
                    : 'A user requested account activation.'}
                </div>
              )}
              <span className="warning-date">
                {(() => {
                  try {
                    return new Date(selected.at || Date.now()).toLocaleString();
                  } catch {
                    return '';
                  }
                })()}
              </span>
            </div>

            <div className="warning-actions">
              <button
                className="mark-read-btn"
                onClick={() => markAsRead(selected.id)}                   
              >
                Mark as Read
              </button>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsAdmin;
