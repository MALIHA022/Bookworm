import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Sidebar from '../components/sidebar';
import Navbar2 from '../components/navbar2';

import './Dashboard.css';
import PostCard from '../components/postcards';
import CreateDonate from '../components/CreateDonate';
import CreateSell from '../components/CreateSell';
import CreateReview from '../components/CreateReview';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch posts 
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = token ? 'http://localhost:5000/api/posts/feed' : 'http://localhost:5000/api/posts';
        const response = await axios.get(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        console.log(response.data);
        setPosts(response.data);
        setLoading(false);  
      } catch (err) {
        console.error('Error fetching posts', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const onNotInterested = (e) => {
      const { postId } = e.detail || {};
      setPosts(prev => prev.filter(p => p._id !== postId));
    };
    window.addEventListener('not-interested', onNotInterested);
    return () => window.removeEventListener('not-interested', onNotInterested);
  }, []);

  // create post
  const handleCreatePost = async (postData) => {
    const token = localStorage.getItem('token');
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
      setPosts(prev => [response.data, ...prev]); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create post');
    }
  };

  return (
    <div className="dashboard-grid">
        <Sidebar />
        <Navbar2 />
      <div className="dashboard-container">
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
            <p>Loading posts...</p>
          ) : (
          <div className="dashboard-posts-section">
            {posts.length === 0 ? (
              <p>No posts available.</p>  
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
          )}
      </div>
    </div>
  );
};
export default Dashboard;
