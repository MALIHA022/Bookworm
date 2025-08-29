import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/sidebar';
import Navbar2 from '../components/navbar2';


import './Explore.css';


const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Explore() {
  const [tab, setTab] = useState('donate'); // 'donate' | 'sell'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const token = localStorage.getItem('token'); // if your API needs auth

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setErr('');
        try {
          const res = await axios.get(`${API}/api/posts`, {
            // keep the param if your backend supports it; otherwise client-side filter still works
            params: { type: tab }, 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          const ALLOWED = ['sell', 'donate'];

          const onlyAllowed = (res.data || []).filter(p => 
            ALLOWED.includes(String(p?.type ?? '').trim().toLowerCase())
          );

          const finalForTab = onlyAllowed.filter(p => 
            String(p?.type ?? '').trim().toLowerCase() === tab
          );

          setItems(finalForTab);
        } catch (e) {
          setErr('Failed to load posts');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [tab, token]);

  // Search function
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(`${API}/api/posts/search`, {
        params: { 
          q: query.trim(),
          type: tab // Filter by current tab
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const ALLOWED = ['sell', 'donate'];
      const onlyAllowed = (res.data || []).filter(p => 
        ALLOWED.includes(String(p?.type ?? '').trim().toLowerCase())
      );

      const finalForTab = onlyAllowed.filter(p => 
        String(p?.type ?? '').trim().toLowerCase() === tab
      );

      setSearchResults(finalForTab);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, tab]);

  return (
    <div className="explore-grid">
      <Navbar2 />
      <Sidebar />
      <div className="explore-container">
          <div className='explore-section'>
              <div className="explore-header">
                <h2>Explore</h2>
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by book title, post title, or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {isSearching && <span className="search-loading">🔍 Searching...</span>}
                </div>
                <div className="toggle">
                  <button
                    className={`toggle-btn ${tab === 'donate' ? 'active' : ''}`}
                    onClick={() => setTab('donate')}>
                    Donations
                  </button>
                  <button
                    className={`toggle-btn ${tab === 'sell' ? 'active' : ''}`}
                    onClick={() => setTab('sell')}>
                    Sell
                  </button>
                </div>
              </div>

              {loading && <p className="muted">Loading…</p>}
              {err && <p className="error">{err}</p>}
              
              {/* Show search results if available */}
              {searchQuery && !isSearching && searchResults.length > 0 && (
                <div className="search-results-header">
                  <h3>Search Results for "{searchQuery}"</h3>
                  <p className="search-count">{searchResults.length} result(s) found</p>
                </div>
              )}
              
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <p className="muted">No results found for "{searchQuery}"</p>
              )}
              
              {!searchQuery && !loading && !err && items.length === 0 && (
                <p className="muted">No {tab} posts yet.</p>
              )}

              <div className="cards">
                {(searchQuery ? searchResults : items).map(p => (
                  <article key={p._id} className="card">
                    <header className="card-head">
                      <span className={`pill ${p.type}`}>{p.type}</span>
                      <h3 className="title">{p.bookTitle || p.title || 'Untitled'}</h3>
                    </header>

                    {p.author && <p className="sub">by {p.author}</p>}
                    {p.description && <p className="desc">{p.description}</p>}
                    {p.content && <p className="desc">{p.content}</p>}

                    {p.type === 'sell' && typeof p.price === 'number' && (
                      <p className="price">Price: ৳ {p.price}</p>
                    )}

                    <footer className="metadata">
                      <span>
                        {p.user?.firstName} {p.user?.lastName}
                      </span>
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                    </footer>
                  </article>
                ))}
              </div>
          </div>
      </div>
    </div>
  );
}
