import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Admin.css';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' }
];

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports(activeTab);
  }, [activeTab]);

  const fetchReports = async (tabKey) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (tabKey !== 'all') params.status = tabKey;
      const { data } = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      // When tab is resolved, API returns both resolved and dismissed
      const safe = (data.reports || []).filter(r => r.post || r.status !== 'resolved');
      setReports(safe);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
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
      fetchReports(activeTab); // Refresh the list using current tab
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
      fetchReports(activeTab); // Refresh the list using current tab
    } catch (error) {
      console.error('Error sending warning:', error);
      alert('Failed to send warning');
    }
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
      fetchReports(activeTab);
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Failed to dismiss report');
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

  const StatusBadge = ({ status }) => (
    <span className={`status-badge status-${status}`}>{status}</span>
  );

  return (
    <div className="admin-reports-page">
      <NavbarAdmin />
      <SidebarAdmin />
      <div className="page-container">
        <div className="reports-section">
          <h2>Reports</h2>

          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="loading">Loading...</p>
          ) : reports.length === 0 ? (
            <p className='no-reports'>No reports to show.</p>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-header">
                    <h3>Report #{report._id.slice(-6)}</h3>
                    <div className="report-meta">
                      <StatusBadge status={report.status || 'pending'} />
                      <span className="report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="report-details">
                    <div className="reporter-info">
                      <strong>Reported by:</strong> {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                    </div>
                    <div className="report-reason">
                      <strong>Reason:</strong> {report.reason}
                    </div>
                  </div>

                  <div className="reported-post">
                    <h4>Reported Post</h4>
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
                    {activeTab === 'pending' ? (
                      <>
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
                        <button 
                          className="close-btn"
                          onClick={() => handleDismiss(report._id)}
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <StatusBadge status={report.status} />
                    )}
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
              <strong>User:</strong> {selectedReport.post?.user?.firstName} {selectedReport.post?.user?.lastName}
            </p>
            <p>
              <strong>Post:</strong> {selectedReport.post?.title || selectedReport.post?.bookTitle}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
