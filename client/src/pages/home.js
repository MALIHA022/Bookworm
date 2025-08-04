// src/pages/home.js
import React from 'react';

const Home = () => {
  return (
    <div>
      <h2>Welcome to BookWorm!!</h2>
      <p>This is  home feed. Book posts will appear here!</p>

      {/* Placeholder for future BookPost components */}
      <div className="book-posts">
        {/* You’ll loop through book posts here */}
      </div>
    </div>
  );
};

export default Home;
