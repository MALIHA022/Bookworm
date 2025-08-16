import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import Navbar2 from '../components/navbar2';
import './Dashboard.css';
import PostCard from '../components/postcards';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts', err);
        setError('Failed to load posts. Please try again later.');
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar2 />
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Posts Section */}
         <div className="posts-section">
            {error && <p>{error}</p>}
            {posts.length === 0 ? (
              <p>No posts available.</p>
            ) : (
              posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
