import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import NavbarAdmin from '../components/navbarAdmin';
import SidebarAdmin from '../components/sidebarAdmin';
import './Dashboard.css';

import PostDetails from '../components/postdetails';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  // Fetch all posts 
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        console.log(response.data);
        setPosts(response.data);
        setFilteredPosts(response.data);
        setLoading(false); 
      } catch (err) {
        console.error('Error fetching posts', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Search 
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = posts.filter(post => 
      (post.title && post.title.toLowerCase().includes(searchTerm)) ||
      (post.bookTitle && post.bookTitle.toLowerCase().includes(searchTerm)) ||
      (post.author && post.author.toLowerCase().includes(searchTerm)) ||
      (post.content && post.content.toLowerCase().includes(searchTerm)) ||
      (post.description && post.description.toLowerCase().includes(searchTerm)) ||
      (post.type && post.type.toLowerCase().includes(searchTerm)) ||
      (post.user?.firstName && post.user.firstName.toLowerCase().includes(searchTerm)) ||
      (post.user?.lastName && post.user.lastName.toLowerCase().includes(searchTerm))
    );
    setFilteredPosts(filtered);
  };
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, posts]);

 return (
   <div>  
      <NavbarAdmin />
      <SidebarAdmin />
      <div className="dashboard-container">
        <h2>All Posts</h2>
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by title, author, content, or user..."
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
          {searchQuery && (
            <div className="search-results-info">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          )}
        </div>
          <div>
              {error && <div className="error-message">{error}</div>}

              {/* Posts Section */}
              { loading ? (
                <p>Loading posts...</p>
              ) : (
              <div className="dashboard-posts-section">
                {filteredPosts.length === 0 ? (
                  searchQuery ? (
                    <p>No posts found matching "{searchQuery}".</p>
                  ) : (
                    <p>No posts available.</p>
                  )
                ) : (
                  filteredPosts.map((post) => (
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
