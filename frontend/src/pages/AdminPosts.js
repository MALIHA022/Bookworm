import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Dashboard.css';

import PostDetails from '../components/postdetails';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  // Fetch all posts 
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

 return (
   <div>  
      <NavbarAdmin />
      <SidebarAdmin />
      <div className="dashboard-container">
        <h2>All Posts</h2>
          <div>
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
                    <PostDetails key={post._id} post={post} />
                  ))
                )}
              </div>
              )}
          </div>
       </div>
   </div>
)
}

export default AllPosts;
