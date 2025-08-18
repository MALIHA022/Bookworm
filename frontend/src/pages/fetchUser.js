// src/pages/UserSettings.js - section 1
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './UserSettings.css';

import Navbar from '../components/navbar2';
import Sidebar from '../components/sidebar';

const ageFromDob = (dobStr) => {
  if (!dobStr) return '-';
  const dob = new Date(dobStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
};

export default function FetchUser() {
  const token = localStorage.getItem('token');
  const localUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);
  const userId = localUser?.id; // <- IMPORTANT: must exist

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  // LEFT: user info
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not logged in.');
        return;
      }
      try {
        // 1) Fetch user profile
        const userRes = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        // Depending on your backend, profile may be wrapped
        const profile =
          userRes.data?.user || userRes.data  || {};

        setProfile(profile);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user data or posts.');

      }
    };
    fetchData();
  }, []);


  return (
    <div >
        <h2>Profile</h2>
        {error ? <p className="error">{error}</p> :
         profile && (
          <div className="profile-card">
            <div className="row"><span><b>Name</b></span>{profile.firstName} {profile.lastName}</div>
            <div className="row"><span><b>Email</b></span>{profile.email}</div>
            <div className="row"><span><b>Gender</b></span>{profile.gender || '-'}</div>
            <div className="row"><span><b>Date of Birth</b></span>{profile.dob ? new Date(profile.dob).toDateString() : '-'}</div>
            <div className="row"><span><b>Age</b></span>{ageFromDob(profile.dob)}</div>
            <hr />
            <div className="row"><span><b>Bookmarks</b></span>{profile.bookmarks?.length ?? 0}</div>
            <div className="row"><span><b>Wishlist</b></span>{profile.wishlist?.length ?? 0}</div>
            <div className="row"><span><b>Liked Posts</b></span>{profile.likedPosts?.length ?? 0}</div>
          </div>
        )}
    </div>
  );
}
