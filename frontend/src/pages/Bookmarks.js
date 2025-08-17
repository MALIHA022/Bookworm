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
      const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
      if (savedBookmarks.length > 0) {
        try {
          const response = await axios.get('http://localhost:5000/api/posts');
          const posts = response.data.filter(post => savedBookmarks.includes(post._id));
          setBookmarkedPosts(posts);  // Set bookmarked posts in state
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
    };

    fetchBookmarkedPosts();
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

