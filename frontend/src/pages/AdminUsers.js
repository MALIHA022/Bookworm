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
      setFilteredUsers(res.data.users || []);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Search 
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(q);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [q, rows]);

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      console.log('Attempting to toggle status for user:', userId, 'Current status:', currentStatus);
      console.log('Auth headers:', auth.headers);
      
      const res = await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/toggle-status`,
        {},
        auth
      );
      
      console.log('Toggle status response:', res.data);
      
      setRows(prevRows => 
        prevRows.map(user => 
          user._id === userId 
            ? { ...user, status: res.data.status }
            : user
        )
      );
      
      // Update filtered users
      setFilteredUsers(prevFiltered => 
        prevFiltered.map(user => 
          user._id === userId 
            ? { ...user, status: res.data.status }
            : user
        )
      );
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setErr(`Failed to update user status: ${error.response?.data?.error || error.message}`);
    }
  };

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
                      <th style={th}>Actions</th>
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
                        <td style={td}>
                          <span className={u.status === 'suspended' ? 'status-suspended' : 'status-active'}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td style={td}>
                          <button
                            onClick={() => toggleUserStatus(u._id, u.status)}
                            className={`status-toggle-btn ${u.status === 'suspended' ? 'activate' : 'suspend'}`}
                            title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        </td>
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