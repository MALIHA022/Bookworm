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
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const localUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);
  const userId = localUser?.id; // <- IMPORTANT: must exist

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName: '', lastName: '', email: '', gender: '', dob: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) { setError('User not logged in.'); return; }
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/profile', auth);
        const p = data?.user || data || localUser || {};
        setProfile(p);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || 'Failed to fetch user profile.');
      }
    };
    run();
  }, [token, localUser]);

  const startEdit = () => {
    setDraft({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      gender: profile?.gender ?? '',
      dob: profile?.dob ? new Date(profile.dob).toISOString().slice(0,10) : ''
    });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft({}); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('http://localhost:5000/api/users/profile', draft, auth);
      const updated = data?.user || draft;
      setProfile(updated);
      // Keep localStorage user in sync if you rely on it elsewhere
      const ls = { ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updated };
      localStorage.setItem('user', JSON.stringify(ls));
      setEditing(false);
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p>Loading profile…</p>;

  return (
    <div className="profile-card">
      {!editing ? (
        <>
          <div className="row"><span><b>Name</b></span>{profile.firstName} {profile.lastName}</div>
          <div className="row"><span><b>Email</b></span>{profile.email}</div>
          <div className="row"><span><b>Gender</b></span>{profile.gender || '-'}</div>
          <div className="row"><span><b>Date of Birth</b></span>{profile.dob ? new Date(profile.dob).toDateString() : '-'}</div>
          <div className="row"><span><b>Age</b></span>{ageFromDob(profile.dob)}</div>
          <hr />
          <div className="row"><span><b>Bookmarks</b></span>{profile.bookmarks?.length ?? 0}</div>
          <div className="row"><span><b>Wishlist</b></span>{profile.wishlist?.length ?? 0}</div>
          <div className="row"><span><b>Liked Posts</b></span>{profile.likedPosts?.length ?? 0}</div>
          <div className="actions">
            <button onClick={startEdit}>Edit Profile</button>
          </div>
        </>
      ) : (
        <>
          <div className="edit-grid">
            <div className='edit-form'>
              <label>First Name
                <input value={draft.firstName} onChange={e=>setDraft(d=>({...d, firstName: e.target.value}))}/>
              </label>
              <label>Last Name
                <input value={draft.lastName} onChange={e=>setDraft(d=>({...d, lastName: e.target.value}))}/>
              </label>
              <label>Email
                <input type="email" value={draft.email} onChange={e=>setDraft(d=>({...d, email: e.target.value}))}/>
              </label>
              <label>Gender
                <select value={draft.gender}
                  onChange={e => setDraft(d => ({ ...d, gender: e.target.value }))}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option> {/* If you want to allow "Other" */}
                </select>
              </label>
              <label>Date of Birth
                <input type="date" value={draft.dob} onChange={e=>setDraft(d=>({...d, dob: e.target.value}))}/>
              </label>
            </div>
          </div>
          <div className="actions">
            <button disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}