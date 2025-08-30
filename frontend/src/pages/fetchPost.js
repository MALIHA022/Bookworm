// src/pages/UserSettings.js - section 2
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const getLocalUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};

export default function FetchUser() {
  const token = localStorage.getItem('token');
  const localUser = useMemo(getLocalUser, []);
  const userId = localUser?.id || localUser?._id;

  const [user, setUser] = useState(localUser || {});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({}); // current editable fields

  const auth = {headers: { Authorization: `Bearer ${token}` }};

  // Fetch user's posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!token) { setError('User not logged in.'); setLoadingPosts(false); return; }
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/me/posts', auth);
        const list = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];
        setPosts(list);
      } catch {
        if (!userId) { setError('No user id found'); setLoadingPosts(false); return; }
        try {
          const { data } = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, auth);
          setPosts(Array.isArray(data) ? data : []);
        } catch (e2) {
          setError(e2?.response?.data?.error || 'Failed to load your posts');
        }
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchMyPosts();
  }, [token, userId]);

  const startEdit = (p) => {
    setEditingId(p._id);
    setDraft({
      type: p.type,
      title: p.title ?? '',
      bookTitle: p.bookTitle ?? '',
      author: p.author ?? '',
      content: p.content ?? '',
      description: p.description ?? '',
      price: p.price ?? ''
    });
  };

  const cancelEdit = () => { setEditingId(null); setDraft({}); };

  const saveEdit = async (id) => {
    try {
      const body = {
        type: draft.type,
        title: draft.title,
        bookTitle: draft.bookTitle,
        author: draft.author,
        content: draft.content,
        description: draft.description,
        price: draft.type === 'sell' ? Number(draft.price) : null
      };

      // Send PUT request to update the post
      const { data: updated } = await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(prev => prev.map(p => (p._id === id ? updated : p)));
      cancelEdit();
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to save');
      console.error(e);
    }
  };




  const removePost = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      // Send DELETE request to remove the post
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 

      // Remove the post from the local state
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to delete');
      console.error(e);
    }
  };



  return (
    <div className='posts'>
      <div className="posts-header">
        <h2>Your Posts</h2>
        <span className="count-badge">{posts.length}</span>
      </div>

      {error && <p className="error">{error}</p>}

      {loadingPosts ? (
        <p>Loading your posts…</p>
      ) : posts.length === 0 ? (
        <div className="empty">You haven&apos;t created any posts yet.</div>
      ) : (
        <ul className="post-list">
          {posts.map((p) => {
            const isEditing = editingId === p._id;
            return (
              <li key={p._id} className="post-item">
                <div className="meta">
                  <span className={`pilltype pilltype-${p.type}`}>{p.type}</span>
                  <span className="date">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span>
                </div>

                {!isEditing ? (
                  <>
                    <h3 className="title">
                      {p.type === 'review'
                        ? (p.title || '(no title)')
                        : (p.bookTitle || p.title || '(no book title)')}
                    </h3>
                    {p.author && <div className="author">by {p.author}</div>}
                    {p.description && <p className="desc">{p.description}</p>}
                    {p.content && <p className="desc">{p.content}</p>}
                    {p.type === 'sell' && typeof p.price === 'number' && (
                      <div className="price">Price: {p.price}</div>
                    )}
                    <div className="actions">
                      <button onClick={() => startEdit(p)}>Edit</button>
                      <button className="danger" onClick={() => removePost(p._id)}>Delete</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="edit-grid">
                      <div className='edit-form'>
                        <label>Type
                          <select value={draft.type} onChange={e => setDraft(d => ({...d, type: e.target.value}))}>
                            <option value="review">review</option>
                            <option value="donate">donate</option>
                            <option value="sell">sell</option>
                          </select>
                        </label>
                        <label>Title
                          <input value={draft.title} onChange={e => setDraft(d => ({...d, title: e.target.value}))}/>
                        </label>
                        <label>Book Title
                          <input value={draft.bookTitle} onChange={e => setDraft(d => ({...d, bookTitle: e.target.value}))}/>
                        </label>
                        <label>Author
                          <input value={draft.author} onChange={e => setDraft(d => ({...d, author: e.target.value}))}/>
                        </label>
                        <label>Description
                          <textarea value={draft.description} onChange={e => setDraft(d => ({...d, description: e.target.value}))}/>
                        </label>
                        <label>Content
                          <textarea value={draft.content} onChange={e => setDraft(d => ({...d, content: e.target.value}))}/>
                        </label>
                        {draft.type === 'sell' && (
                          <label>Price
                            <input type="number" value={draft.price} onChange={e => setDraft(d => ({...d, price: Number(e.target.value)}))}/>
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => saveEdit(p._id)}>Save</button>
                      <button className="secondary" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

