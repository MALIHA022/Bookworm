import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';

import Home from './pages/home';
import Favorites from './pages/likedpost';
import Bookmarks from './pages/bookmarked';
import CreatePost from './pages/createpostpage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [posts, setPosts] = useState([]);

  // Load posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/books'); // Adjust port if needed
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    };

    fetchPosts();
  }, []);

    // Add new post
  const handleCreatePost = async (post) => {
    try {
      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      setPosts(prev => [data, ...prev]); // Update UI
      navigate('/'); // Close modal and go back to homepage
    } catch (err) {
      alert('Failed to post book');
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />
      <div style={{ marginLeft: '60px', marginTop: '60px', padding: '20px' }}>
        <Routes location={state?.backgroundLocation || location}>
          <Route path="/" element={<Home posts={posts} />} />
          <Route path="/explore" element={<h1>Explore</h1>} />
          <Route path="/bookmarks" element={<Bookmarks userId={state?.userId} />} />
          <Route path="/favorites" element={<Favorites userId={state?.userId} />} />
          <Route path="/settings" element={<h1>Settings</h1>} />
          <Route path="/create-post" element={<CreatePost />} />
        </Routes>

        {/* Modal route */}
        {state?.backgroundLocation && (
          <Routes>
            <Route path="/create-post" element={<CreatePost onPost={handleCreatePost} />} />
          </Routes>
        )}
      </div>
    </>
  );
}

export default App;


