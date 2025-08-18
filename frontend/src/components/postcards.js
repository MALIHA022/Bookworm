// components/PostCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './postcards.css';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
    setBookmarked(savedBookmarks.includes(post._id));  // Check if bookmarked
  }, [post._id]);

  // Handle like
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1); // Update like count
  };

  // Handle bookmark
  const handleBookmark = () => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
    if (!bookmarked) {
      savedBookmarks.push(post._id);  // Add post to bookmarked list
      setBookmarked(true);
    } else {
      const index = savedBookmarks.indexOf(post._id);
      savedBookmarks.splice(index, 1);  // Remove post from bookmarked list
      setBookmarked(false);
    }
    localStorage.setItem('bookmarkedPosts', JSON.stringify(savedBookmarks)); // Save to localStorage
  };

  // Handle wishlisted
  const handleWishlist = () => {
    const savedWishlists = JSON.parse(localStorage.getItem('wishlistedPosts')) || [];
    if (!wishlisted) {
      savedWishlists.push(post._id);  // Add post to wishlisted list
      setWishlisted(true);
    } else {
      const index = savedWishlists.indexOf(post._id);
      savedWishlists.splice(index, 1);  // Remove post from wishlisted list
      setWishlisted(false);
    }
    localStorage.setItem('wishlistedPosts', JSON.stringify(savedWishlists)); // Save to localStorage
  };
  
  // Conditional rendering of the wishlist button based on the post type
  const renderWishlistButton = () => {
    if (post.type === 'sell' || post.type === 'donate') {
      return (
        <button onClick={() => setWishlisted(!wishlisted)}>
          {wishlisted ? '📝' : '📃'}
        </button>
      );
    }
    return null; // Don't render Wishlist for 'review' posts
  };

  return (
    <div className="bookpostcard">
        <div className='card-header'>
          {/* posted by user {firstname lastname} */}
          <span className={`pill pill-${post.type}`}>{post.type}</span>
          <h4> {post.user.firstName} {post.user.lastName}</h4>
             <h3>Book Title: {post.title || post.bookTitle}</h3>
        </div>
        
        <div className='card-author'>
            <p><strong>Author:</strong> {post.author}</p>
        </div>

        <div className='card-content'>
            <p>"{post.content || post.description}"</p>
        </div>
        
        <div className="post-actions">
            <button onClick={handleWishlist}>{renderWishlistButton()}</button>
            <button onClick={handleBookmark}>
              {bookmarked ? '🔖' : '💾'}
            </button>
            <button onClick={handleLike}>
              {liked ? '❤️' : '🤍'}
            </button>
            <div className="more-menu">
                  <button onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                  {showDropdown && (
                  <div className="dropdown">
                      <button>🔄 Edit</button>
                      <button>🚫 Report</button>
                      <button>🙅 Not Interested</button>
                      <button>🗑️ Delete</button>
                  </div>
                  )}
            </div>
        </div>
    </div>
    );
};

export default PostCard;
