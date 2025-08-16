import React, { useState } from 'react';
import './Dashboard.css'; 
import Sidebar from '../components/sidebar';
import Navbar2 from '../components/navbar2'; 
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page after logout
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
        <Navbar2 user={user} setShowDropdown={setShowDropdown} 
        showDropdown={showDropdown} handleLogout={handleLogout} />

      <div className="main-content">
        <div className="posts-section">
            <h3>User's Post Title</h3>
            <p>This is a sample post content.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
