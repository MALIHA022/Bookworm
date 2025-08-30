import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar2';

import FetchUser from './fetchUser';
import FetchPost from './fetchPost';

const UserSettings = () => {
    const [error, setError] = useState('');

  return (
    <div className="settings-grid">
      <Navbar />
      <Sidebar />
      <div className="settings-container">
        <section className="profile-pane">
          <h2>Profile</h2>
          <div className="profile-card">
            <FetchUser />
          </div>
        </section>
    
        <section className="posts-pane">
          <FetchPost />
        </section>
      </div>
    </div>
  );
}
export default UserSettings;
