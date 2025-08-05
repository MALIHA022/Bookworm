import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';

import Home from './pages/home';
import CreatePost from './pages/createpostpage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [posts, setPosts] = useState([]);

  // Load posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('http://localhost:5000/api/books');
      const data = await res.json();
      setPosts(data);
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
          <Route path="/bookmarks" element={<h1>Bookmarks</h1>} />
          <Route path="/favorites" element={<h1>Favorites</h1>} />
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

// const handleCreatePost = async (post) => {
//   try {
//     const response = await fetch('http://localhost:5000/api/books', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(post),
//     });

//     if (!response.ok) throw new Error('Failed to post book');

//     const result = await response.json();
//     console.log("Posted:", result);
//   } catch (err) {
//     alert(err.message);
//   }
// };

