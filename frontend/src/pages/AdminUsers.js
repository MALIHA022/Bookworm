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
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const auth = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  const load = async (opts = {}) => {
    try {
      setLoading(true);
      setErr('');
      const params = new URLSearchParams({
        q: opts.q ?? q,
        page: String(opts.page ?? page),
        limit: String(meta.limit || 20),
      });
      const url = `http://localhost:5000/api/admin/users?${params.toString()}`;
      const res = await axios.get(url, auth);
      setRows(res.data.users || []);
      setMeta({
        total: res.data.total,
        pages: res.data.pages,
        limit: res.data.limit,
      });
      setPage(res.data.page);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load({ page: 1 }); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load({ q, page: 1 });
  };

  const prev = () => page > 1 && load({ page: page - 1 });
  const next = () => page < meta.pages && load({ page: page + 1 });

  const th = { textAlign:'left', padding:'10px 8px', borderBottom:'1px solid #eee' };
  const td = { padding:'10px 8px', borderBottom:'1px solid #f3f3f3' };


  return (
    <div>  
        <NavbarAdmin />
        <SidebarAdmin />
        <div className="container">
          <h2>All Users</h2>
          <div className="main-content">
            <div className='searchbar'>
              <form onSubmit={onSearch}>
                <input className='inputarea'
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  placeholder="Search name or email…"/>
                <button type="submit">Search</button>
              </form>
            </div>

            {loading && <div>Loading…</div>}
            {err && <div style={{ color:'crimson' }}>{err}</div>}

            {!loading && !rows.length && !err && (
              <div>No users found.</div>
            )}

            {!!rows.length && (
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
                    {rows.map(u => (
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

            <h4>Total Users: {meta.total} </h4>
            <div className='page-buttons'>
              <button onClick={prev} disabled={page<=1}><b>Prev</b></button>
                Page {page} / {meta.pages || 1}
              <button onClick={next} disabled={page>=meta.pages}><b>Next</b></button>
            </div>
          </div>
        </div>
    </div>
    );
}