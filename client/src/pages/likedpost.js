import React, { useEffect, useState } from 'react';
import PostCard from '../components/postcards';

const Favorites = ({ userId }) => {
  const [likedPosts, setLikedPosts] = useState([]);

useEffect(() => {
  const fetchLikedPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/books/likes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch liked posts');
      }

      const data = await response.json();
      setLikedPosts(data); // your useState setter
    } catch (err) {
      console.error(err);
    }
  };

  fetchLikedPosts();
}, []);

  return (
    <div>
      <h2>Liked Posts</h2>
      <div className="bookposts">
        {likedPosts.map((post, idx) => (
          <PostCard key={idx} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
