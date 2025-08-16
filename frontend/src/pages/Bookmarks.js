import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard';  // Reuse the PostCard component
import './Bookmarks.css';

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
    <div className="bookmarks-container">
      <h2>Your Bookmarked Posts</h2>
      {bookmarkedPosts.length === 0 ? (
        <p>No bookmarked posts yet.</p>
      ) : (
        bookmarkedPosts.map(post => (
          <PostCard key={post._id} post={post} />
        ))
      )}
    </div>
  );
};

export default Bookmarks;
