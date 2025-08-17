import React, { useEffect, useState } from 'react';
import PostCard from '../components/postcards';

const Bookmarked = ({ userId }) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

useEffect(() => {
  const fetchBookmarkedPosts = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/books/bookmarks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await res.json();
      setBookmarkedPosts(data); // assuming `setBookmarkedPosts` is your useState setter
    } catch (err) {
      console.error(err);
    }
  };

  fetchBookmarkedPosts();
}, []);


  return (
    <div>
      <h2>Bookmarked Posts</h2>
      <div className="bookposts">
        {bookmarkedPosts.map((post, idx) => (
          <PostCard key={idx} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Bookmarked;
