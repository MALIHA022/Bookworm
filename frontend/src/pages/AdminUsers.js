// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Admin.css';

const User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  role: '',
  status: '',
  createdAt: '',
};

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const auth = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const url = 'http://localhost:5000/api/admin/users';
      const res = await axios.get(url, auth);
      setRows(res.data.users || []);
      setFilteredUsers(res.data.users || []); // Initialize filtered users
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Search functionality
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredUsers(rows);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = rows.filter(user => 
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.gender && user.gender.toLowerCase().includes(searchTerm)) ||
      (user.role && user.role.toLowerCase().includes(searchTerm)) ||
      (user.status && user.status.toLowerCase().includes(searchTerm)) ||
      (user.dob && user.dob.toLowerCase().includes(searchTerm))
    );
    setFilteredUsers(filtered);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(q);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [q, rows]);

  const th = { textAlign:'left', padding:'10px 8px', borderBottom:'1px solid #eee' };
  const td = { padding:'10px 8px', borderBottom:'1px solid #f3f3f3' };


  return (
    <div>  
        <NavbarAdmin />
        <SidebarAdmin />
        <div className="container">
          <h2>All Users</h2>
          <div className="main-content">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search by name, email, gender, role, status, or date of birth..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="search-input"
                />
                {q && (
                  <button
                    className="clear-search-btn"
                    onClick={() => {
                      setQ('');
                      setFilteredUsers(rows);
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {q && (
                <div className="search-results-info">
                  Showing {filteredUsers.length} of {rows.length} users
                </div>
              )}
            </div>

            {loading && <div>Loading…</div>}
            {err && <div style={{ color:'crimson' }}>{err}</div>}

            {!loading && !filteredUsers.length && !err && (
              <div>
                {q ? `No users found matching "${q}".` : 'No users found.'}
              </div>
            )}

            {!!filteredUsers.length && (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Gender</th>
                      <th style={th}>Date of Birth</th>
                      <th style={th}>Role</th>
                      <th style={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                        <tr key={u._id}>
                        <td style={td}>{u.firstName} {u.lastName}</td>
                        <td style={td}>{u.email}</td>
                        <td style={td}>{u.gender || '-'}</td>
                        <td style={td}>{u.dob}</td>
                        <td style={td}>{u.role}</td>
                        <td style={td}>{u.status || 'active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4>Total Users: {rows.length} </h4>
          </div>
        </div>
    </div>
    );
}