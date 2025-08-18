// src/pages/UserSettings.js - section 2
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './UserSettings.css'; // minimal styles below

export default function FetchUser() {
  const token = localStorage.getItem('token');
  const localUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const [user, setUser] = useState(localUser || {});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!token) return;
      try {
        // Option A (recommended): /api/users/me/posts  (uses token)
        const { data } = await axios.get('http://localhost:5000/api/users/me/posts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(data.posts || []);
      } catch {
        try {
          // Option B (uses existing route): /api/posts/user/:userId
          if (user?.id) {
            const { data } = await axios.get(`http://localhost:5000/api/posts/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(data || []);
          }
        } catch (e2) {
          console.error(e2);
          setError(e2?.response?.data?.error || 'Failed to load your posts');
        }
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchMyPosts();
  }, [token, user?.id]);

  return (
    <div>
        <div className="posts-header">
          <h2>Your Posts</h2>
          <span className="count-badge">{posts.length}</span>
        </div>

        {loadingPosts ? (
          <p>Loading your posts…</p>
        ) : posts.length === 0 ? (
          <div className="empty">You haven't created any posts yet.</div>
        ) : (
          <ul className="post-list">
            {posts.map(p => (
              <li key={p._id} className="post-item">
                <div className="meta">
                  <span className={`pill pill-${p.type}`}>{p.type}</span>
                  <span className="date">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="title">
                  {p.type === 'review' ? (p.title || '(no title)') : (p.bookTitle || '(no book title)')}
                </h3>
                <div className="author">by {p.author}</div>
                {p.description && <p className="desc">{p.description}</p>}
                {p.content && <p className="desc">{p.content}</p>}
                {p.type === 'sell' && typeof p.price === 'number' && (
                  <div className="price">Price: {p.price}</div>
                )}
                {/* Optional: add Edit/Delete actions here */}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

