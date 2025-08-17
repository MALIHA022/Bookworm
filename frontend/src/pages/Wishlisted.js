import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar2 from '../components/navbar2';
import Sidebar from '../components/sidebar';
import PostCard from '../components/postcards';
import './Dashboard.css'

const WishlistedPage = () => {
  const [wishlistedPosts, setWishlistedPosts] = useState([]);

    useEffect(() => {
      const fetchWishlistedPosts = async () => {
        const savedWishlists = JSON.parse(localStorage.getItem('wishlistedPosts')) || [];
        if (savedWishlists.length > 0) {
          try {
            const response = await axios.get('http://localhost:5000/api/posts');
            const posts = response.data.filter(post => savedWishlists.includes(post._id));
            setWishlistedPosts(posts);  // Set wishlisted posts in state
          } catch (error) {
            console.error('Error fetching posts:', error);
          }
        }
      };

      fetchWishlistedPosts();
    }, []);

  return (
    <div className="wishlisted-page">
      <Navbar2 />
      <Sidebar />
      <div className="page-container">
          <div className="posts-section">
            <h2>Wishlisted Posts</h2>
            {wishlistedPosts.length === 0 ? (
              <p className='no-posts'>No wishlisted posts.</p>  // Display if no posts are found
            ) : (
              wishlistedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
      </div>
    </div>
  );
};

export default WishlistedPage;
