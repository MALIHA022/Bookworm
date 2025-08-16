import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/postcards';
import './UserSettings.css';

const UserSettings = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);

  const userId = JSON.parse(localStorage.getItem('user'))._id;  // Get logged-in user's ID from localStorage

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`);
        setUserPosts(response.data);  // Store user’s posts in state
      } catch (err) {
        setError('Error fetching your posts.');
      }
    };
    fetchUserPosts();
  }, [userId]);

  return (
    <div className="settings-container">
      <h2>Your Posts</h2>
      {error && <p>{error}</p>}
      {userPosts.length === 0 ? (
        <p>You haven’t posted anything yet.</p>
      ) : (
        userPosts.map(post => (
          <PostCard key={post._id} post={post} />
        ))
      )}
    </div>
  );
};

export default UserSettings;
