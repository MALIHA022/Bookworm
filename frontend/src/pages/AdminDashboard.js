// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Dashboard.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({});
  // const [reports, setReports] = useState([]);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const load = async () => {
      const m = await axios.get('http://localhost:5000/api/admin/metrics', getAuth());
      setMetrics(m.data);

      // // This will 404 unless you add the routes above
      // const r = await axios.get('http://localhost:5000/api/admin/reports?status=pending', getAuth());
      // setReports(r.data);
    };
    load();
  }, []);

  // const actionReport = async (id, status, feedback='') => {
  //   await axios.patch(`http://localhost:5000/api/admin/reports/${id}`, { status, feedback }, getAuth());
  //   setReports(prev => prev.filter(r => r._id !== id));
  // };

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

          <h3 style={{ marginTop: 24 }}>Pending Reports</h3>
          {/* {reports.map(r => (
            <div key={r._id} style={{ border:'1px solid #ddd', padding:12, borderRadius:8, marginBottom:12 }}>
              <div><b>Post:</b> {r.post?.title || r.post?.bookTitle} <i>({r.post?.type})</i></div>
              <div><b>Reason:</b> {r.reason}</div>
              <div><b>Reported By:</b> {r.reportedBy?.firstName} {r.reportedBy?.lastName} ({r.reportedBy?.email})</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => actionReport(r._id, 'actioned', 'Handled by admin')}>Mark Actioned</button>{' '}
                <button onClick={() => actionReport(r._id, 'dismissed', 'Not a violation')}>Dismiss</button>
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
}
