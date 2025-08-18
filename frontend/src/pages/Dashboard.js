import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/sidebar';
import Navbar2 from '../components/navbar2';

import './Dashboard.css';
import PostCard from '../components/postcards';
import CreateDonate from '../components/CreateDonate';
import CreateSell from '../components/CreateSell';
import CreateReview from '../components/CreateReview';
import { set } from 'mongoose';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        console.log(response.data);
        setPosts(response.data);
        setLoading(false);  // Set loading to false after fetching
      } catch (err) {
        console.error('Error fetching posts', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Function to handle creating a post
  const handleCreatePost = async (postData) => {
    const token = localStorage.getItem('token'); // JWT from login
    if (!token) {
      alert('You must be logged in to create a post.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/posts/create',
        postData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev => [response.data, ...prev]); // Add new post to top
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create post');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar2 />

        <div className="post-buttons">
          <button onClick={() => setShowDonateModal(true)}>Create Donate Post</button>
          <button onClick={() => setShowSellModal(true)}>Create Sell Post</button>
          <button onClick={() => setShowReviewModal(true)}>Create Review Post</button>
        </div>

        {showDonateModal && (
          <CreateDonate
          onPost={handleCreatePost}
          onClose={() => setShowDonateModal(false)}
          />
        )}

        {showSellModal && (
          <CreateSell
            onPost={handleCreatePost}
            onClose={() => setShowSellModal(false)}
          />
        )}

        {showReviewModal && (
          <CreateReview
            onPost={handleCreatePost}
            onClose={() => setShowReviewModal(false)}
            />
        )}

        {error && <div className="error-message">{error}</div>}

        {/* Posts Section */}
        { loading ? (
          <p>Loading posts...</p>  // Show a loading message while fetching
        ) : (
        <div className="posts-section">
          {posts.length === 0 ? (
            <p>No posts available.</p>  // Display message if there are no posts
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />  // Display each post as a PostCard
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
