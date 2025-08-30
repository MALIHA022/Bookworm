// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale,LinearScale,PointElement,LineElement,BarElement,Title,Tooltip,Legend } from 'chart.js';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activationRequests, setActivationRequests] = useState([]);

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [metricsRes, chartDataRes, activationRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/metrics', getAuth()),
          axios.get('http://localhost:5000/api/admin/chart-data', getAuth()),
          axios.get('http://localhost:5000/api/admin/activation-requests', getAuth())
        ]);
        
        setMetrics(metricsRes.data);
        setChartData(chartDataRes.data);
        setActivationRequests(activationRes.data.activationRequests || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Activity Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Prepare chart data
  const postsChartData = {
    labels: chartData.posts?.labels || [],
    datasets: [
      {
        label: 'Posts Created',
        data: chartData.posts?.data || [],
        borderColor: '#35a2ebff',
        backgroundColor: '#35a2eb80',
        tension: 0.1
      }
    ]
  };

  const reportsChartData = {
    labels: chartData.reports?.labels || [],
    datasets: [
      {
        label: 'Reports Created',
        data: chartData.reports?.data || [],
        borderColor: '#ff6384ff',
        backgroundColor: '#ff638480',
        tension: 0.1
      }
    ]
  };

  const usersChartData = {
    labels: chartData.users?.labels || [],
    datasets: [
      {
        label: 'New Users Registered',
        data: chartData.users?.data || [],
        borderColor: '#4bc0c0ff',
        backgroundColor: '#4bc0c080',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="admin-dashboard-grid">
        <NavbarAdmin />
        <SidebarAdmin />
        <div className="dashboard-container">
          <h2>Admin Dashboard</h2>
          <div className="loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-grid">
      <NavbarAdmin />
      <SidebarAdmin />
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
        <div className='main-content'>
          {/* Metrics Section - Keep as is */}
          <div className="dashboard-metrics">
            <div className="metric-card">
              <div className="metric-icon">📣</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalReports ?? '-'}</div>
                <div className="metric-label">Total Reports</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.pendingReports ?? '-'}</div>
                <div className="metric-label">Pending Reports</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalUsers ?? '-'}</div>
                <div className="metric-label">Total Users</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📝</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.totalPosts ?? '-'}</div>
                <div className="metric-label">Total Posts</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <h3>Activity Analytics</h3>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-container">
                <h4>Posts Created Over Time</h4>
                <Line data={postsChartData} options={chartOptions} />
              </div>
              
              <div className="chart-container">
                <h4>Reports Created Over Time</h4>
                <Line data={reportsChartData} options={chartOptions} />
              </div>
              
              <div className="chart-container">
                <h4>New Users Registered Over Time</h4>
                <Line data={usersChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Activation Requests Section */}
          {activationRequests.length > 0 && (
            <div className="activation-requests-section">
              <h3>Pending Activation Requests</h3>
              <div className="activation-requests-list">
                {activationRequests.map((request, index) => (
                  <div key={request.id} className="activation-request-item">
                    <div className="request-info">
                      <strong>{request.userName}</strong> ({request.userEmail})
                    </div>
                    <div className="request-message">{request.message}</div>
                    <div className="request-time">
                      Requested: {new Date(request.at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
