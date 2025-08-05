// components/PostCard.js
import React, { useState } from 'react';
import './postcards.css';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bookpostcard">
        <div className='card-header'>
            <h3>{post.title}</h3>
        </div>
        
        <div className='card-author'>
            <p><strong>Author:</strong> {post.author}</p>
        </div>

        <div className='card-content'>
            <p>{post.content}</p>
        </div>
        
        <div className="post-actions">
            <button onClick={() => setBookmarked(!bookmarked)}>
              {bookmarked ? '🔖' : '💾'}
            </button>
            <button onClick={() => setLiked(!liked)}>
              {liked ? '❤️' : '🤍'}
            </button>
            <div className="more-menu">
                  <button onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                  {showDropdown && (
                  <div className="dropdown">
                      <button>🚫 Report</button>
                      <button>🙅 Not Interested</button>
                  </div>
                  )}
            </div>
        </div>
    </div>
    );
};

export default PostCard;
