import React from 'react';

const Home = ({ posts }) => {
  return (
    <div>
      <h2>Recent Book Posts</h2>
      {posts.map((post) => (
        <div key={post._id} className="book-card">
          <h3>{post.title}</h3>
          <p><strong>Author:</strong> {post.author}</p>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Home;
