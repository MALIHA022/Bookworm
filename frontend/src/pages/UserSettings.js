// src/pages/UserSettings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './UserSettings.css';

import Sidebar from '../components/sidebar';

import FetchUser from './fetchUser';
import FetchPost from './fetchPost';

const UserSettings = () => {
    const [error, setError] = useState('');

  return (
    <div className="settings-grid">
      <Sidebar />
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
  );
}
export default UserSettings;
