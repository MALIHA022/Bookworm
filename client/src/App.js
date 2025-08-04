import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
// import Navbar from './components/navbar';

const App = () => {
  return (
    <Router>
      <Sidebar />
      {/* <Navbar /> */}
      <div style={{ marginLeft: '60px', marginTop: '60px', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/explore" element={<h1>Explore</h1>} />
          <Route path="/bookmarks" element={<h1>Bookmarks</h1>} />
          <Route path="/favorites" element={<h1>Favorites</h1>} />
          <Route path="/settings" element={<h1>Settings</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
