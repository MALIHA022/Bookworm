// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Dashboard.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({});
  const [reports, setReports] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out reports where the post has been deleted (post is null)
      const safe = (data.reports || []).filter(r => r.post);
      setReports(safe);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleRemovePost = async (reportId) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/reports/${reportId}`, {
        action: 'remove'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Post removed successfully');
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error removing post:', error);
      alert('Failed to remove post');
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      alert('Please enter a warning message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/reports/${selectedReport._id}`, {
        action: 'warn',
        warningMessage: warningMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Warning sent successfully');
      setShowWarningModal(false);
      setSelectedReport(null);
      setWarningMessage('');
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error sending warning:', error);
      alert('Failed to send warning');
    }
  };

  const openWarningModal = (report) => {
    setSelectedReport(report);
    setShowWarningModal(true);
  };

  const closeWarningModal = () => {
    setShowWarningModal(false);
    setSelectedReport(null);
    setWarningMessage('');
  };
  
  const handleDismiss = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/reports/${reportId}`, {
        action: 'dismiss'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Report dismissed');
      fetchReports();
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Failed to dismiss report');
    }
  };

  const load = async () => {
      const m = await axios.get('http://localhost:5000/api/admin/metrics', getAuth());
      setMetrics(m.data);
    };
    load();

  return (
    <div className="admin-dashboard-grid">
      <NavbarAdmin />
      <SidebarAdmin />
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        <div className='main-content'>
          <div className="dashboard-metrics">
            <div>📣 Total Reports: <b>{metrics.totalReports ?? '-'}</b></div>
            <div>⏳ Pending Reports: <b>{metrics.pendingReports ?? '-'}</b></div>
            <div>👥 Users: <b>{metrics.totalUsers ?? '-'}</b></div>
            <div>📝 Posts: <b>{metrics.totalPosts ?? '-'}</b></div>
          </div>

        <div className="page-container">
          <div className="reports-section">
            <h2>Pending Reports</h2>
            {reports.length === 0 ? (
              <p className="no-reports">No pending reports.</p>
            ) : (
              <div className="reports-list">
                {reports.map((report) => (
                  <div key={report._id} className="report-card">
                    <div className="report-header">
                      <h3>Report #{report._id.slice(-6)}</h3>
                      <span className="report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="report-details">
                      <div className="reporter-info">
                        <strong>Reported by:</strong> {report.reportedBy.firstName} {report.reportedBy.lastName}
                      </div>
                      <div className="report-reason">
                        <strong>Reason:</strong> {report.reason}
                      </div>
                    </div>

                    <div className="reported-post">
                      <h4>Reported Post:</h4>
                      <div className="post-info">
                        <p><strong>Type:</strong> {report.post?.type}</p>
                        <p><strong>Title:</strong> {report.post?.title || report.post?.bookTitle}</p>
                        <p><strong>Author:</strong> {report.post?.author}</p>
                        <p><strong>Content:</strong> {report.post?.content || report.post?.description}</p>
                        {report.post?.price && <p><strong>Price:</strong> ${report.post?.price}</p>}
                        <p><strong>Posted by:</strong> {report.post?.user?.firstName} {report.post?.user?.lastName}</p>
                      </div>
                    </div>

                    <div className="report-actions">
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemovePost(report._id)}
                      >
                        🗑️ Remove Post
                      </button>
                      <button 
                        className="warn-btn"
                        onClick={() => openWarningModal(report)}
                      >
                        ⚠️ Send Warning
                      </button>
                      <button className='dismiss-btn' onClick={() => handleDismiss(report._id)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Warning Modal */}
        {showWarningModal && selectedReport && (
          <div className="warning-modal-overlay">
            <div className="warning-modal-content">
              <h3>Send Warning to User</h3>
              <p>
                <strong>User:</strong> {selectedReport.post.user.firstName} {selectedReport.post.user.lastName}
              </p>
              <p>
                <strong>Post:</strong> {selectedReport.post.title || selectedReport.post.bookTitle}
              </p>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message..."
                rows="4"
                className="warning-textarea"
              />
              <div className="warning-actions">
                <button className="send-warning-btn" onClick={handleSendWarning}>
                  Send Warning
                </button>
                <button className="cancel-btn" onClick={closeWarningModal}>
                  Cancel
                </button>
                <button className='dismiss-btn' onClick={() => handleDismiss(selectedReport._id)}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
