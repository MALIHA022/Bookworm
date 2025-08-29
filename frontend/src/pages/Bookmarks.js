import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Navbar2 from '../components/navbar2';
import Sidebar from '../components/sidebar';
import PostCard from '../components/postcards';  // Reuse the PostCard component

import './Dashboard.css';

const Bookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/posts/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarkedPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
      }
    };

    fetchBookmarkedPosts();
  }, []);

  useEffect(() => {
    const onBookmarkChanged = (e) => {
      const { postId, bookmarked } = e.detail || {};
      if (bookmarked) {
        // If a post was bookmarked elsewhere, refetch to include it
        (async () => {
          try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/posts/bookmarks', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarkedPosts(data.posts || []);
          } catch (err) {
            console.error('Error refreshing bookmarks:', err);
          }
        })();
      } else {
        // If a post was unbookmarked elsewhere, remove it from the current list
        setBookmarkedPosts(prev => prev.filter(p => p._id !== postId));
      }
    };

    window.addEventListener('bookmark-changed', onBookmarkChanged);
    return () => window.removeEventListener('bookmark-changed', onBookmarkChanged);
  }, []);

  return (
    <div className="bookmarks-page">
      <Navbar2 />
      <Sidebar />
        <div className="page-container">
          <div className="posts-section">
          <h2>Bookmarked Posts</h2>
            {bookmarkedPosts.length === 0 ? (
              <p className='no-posts'>No bookmarked posts yet.</p>
            ) : (
              bookmarkedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    );
}

export default Bookmarks;

