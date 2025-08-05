import React, { useEffect, useState } from 'react';
import PostCard from '../components/postcards';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetching posts from backend
    fetch("http://localhost:5000/api/books")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
      });
  }, []);

  return (
    <div>
      <h2>Recent Book Posts</h2>
      <div className="bookposts">
        {posts.map((post, idx) => (
          <PostCard key={idx} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
