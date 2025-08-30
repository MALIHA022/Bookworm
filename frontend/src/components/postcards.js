import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './postcards.css';
import './modal.css';
import { AuthContext } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const authCtx = useContext(AuthContext) || {};
  const user = authCtx.user || null;
  const currentUserId = (user && (user.userId || user.userID)) || localStorage.getItem('userID');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");


  
  useEffect(() => {
    if (!currentUserId) {
      setBookmarked(false);
      return;
    }
    const key = `bookmarkedPosts:${currentUserId}`;
    const savedBookmarks = JSON.parse(localStorage.getItem(key)) || [];
    setBookmarked(savedBookmarks.includes(post._id));
  }, [post._id, currentUserId]);

  //liked posts
  useEffect(() => {
    const initLiked = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get(`http://localhost:5000/api/posts/${post._id}/liked`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiked(!!data.liked);
      } catch (e) {
        console.error('Failed to fetch like state', e);
      }
    };
    initLiked();
  }, [post._id]);

  // bookmarked posts
  useEffect(() => {
    const initBookmark = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get(`http://localhost:5000/api/posts/${post._id}/bookmarked`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarked(!!data.bookmarked);
      } catch (e) {
        console.error('Failed to fetch bookmark state', e);
      }
    };
    initBookmark();
  }, [post._id]);

  // wishlisted posts
  useEffect(() => {
    const initWishlist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get(`http://localhost:5000/api/posts/${post._id}/wishlisted`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlisted(!!data.wishlisted);
      } catch (e) {
        console.error('Failed to fetch wishlist state', e);
      }
    };
    initWishlist();
  }, [post._id]);

  // Handle like count
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like posts');
        return;
      }
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!!data.liked);
      setLikeCount(typeof data.likes === 'number' ? data.likes : (data.liked ? likeCount + 1 : Math.max(likeCount - 1, 0)));
    } catch (e) {
      console.error('Failed to toggle like', e);
      alert('Failed to toggle like');
    }
  };

  // Handle bookmark 
  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to bookmark posts');
        return;
      }
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarked(!!data.bookmarked);

      const key = currentUserId ? `bookmarkedPosts:${currentUserId}` : 'bookmarkedPosts';
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      const idx = saved.indexOf(post._id);
      if (data.bookmarked && idx === -1) saved.push(post._id);
      if (!data.bookmarked && idx !== -1) saved.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(saved));

      window.dispatchEvent(new CustomEvent('bookmark-changed', {
        detail: { postId: post._id, bookmarked: !!data.bookmarked }
      }));
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
      alert('Failed to toggle bookmark');
    }
  };

  // Handle wishlist 
  const handleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add posts to wishlist');
        return;
      }
      const { data } = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/wishlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlisted(!!data.wishlisted);

      const key = currentUserId ? `wishlistedPosts:${currentUserId}` : 'wishlistedPosts';
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      const idx = saved.indexOf(post._id);
      
      if (data.wishlisted && idx === -1) saved.push(post._id);
      if (!data.wishlisted && idx !== -1) saved.splice(idx, 1);
      
      localStorage.setItem(key, JSON.stringify(saved));

      window.dispatchEvent(new CustomEvent('wishlist-changed', {
        detail: { postId: post._id, wishlisted: !!data.wishlisted }
      }));
    } catch (e) {
      console.error('Failed to toggle wishlist', e);
      alert('Failed to toggle wishlist');
    }
  };
  
  // Conditional rendering of the wishlist button
  const renderWishlistButton = () => {
    if (post.type === 'sell' || post.type === 'donate') {
      return (
        <button onClick={() => setWishlisted(!wishlisted)}>
          {wishlisted ? '📝' : '📃'}
        </button>
      );
    }
    return null;
  };

  const handleNotInterested = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to hide posts');
        return;
      }
      await axios.post(
        `http://localhost:5000/api/posts/${post._id}/not-interested`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.dispatchEvent(new CustomEvent('not-interested', {
        detail: { postId: post._id }
      }));
    } catch (e) {
      console.error('Failed to mark not interested', e);
      alert('Failed to mark not interested');
    }
  };

  // Submit report
  const handleReportSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to report posts");
        return;
      }
      
      const { data } = await axios.post(`http://localhost:5000/api/posts/${post._id}/report`, {
        reason: reportReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Report submitted successfully");
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to submit report");
      }
    }
  };

  return (
    <div className="bookpostcard">
          <div className='card-header'>
            <span className={`pill pill-${post.type}`}>{post.type}</span>
            <h4> {post.user.firstName} {post.user.lastName}</h4>
          </div>

        <div className='card-body'>
          <div className='card-title'>
            <h3>Book Title: {post.title || post.bookTitle}</h3>
          </div>
          <div className='card-author'>
              <p><strong>Author:</strong> {post.author}</p>
          </div>

          <div className='card-content'>
              <p>"{post.content || post.description}"</p>
          </div>
        </div>

        <div className="post-actions">
            <button onClick={handleWishlist}>{renderWishlistButton()}</button>
            <button onClick={handleBookmark}>
              {bookmarked ? '⭐' : '✰'}
            </button>
            <button onClick={handleLike}>
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
            <div className="more-menu">
                  <button onClick={() => setShowDropdown(!showDropdown)}>⋮</button>
                  {showDropdown && (
                  <div className="dropdown">
                    <button onClick={() => setShowReportModal(true)}>🚫 Report</button>
                    <button onClick={handleNotInterested}>🙅 Not Interested</button>
                  </div>
                  )}
            </div>
        </div>
        {showReportModal && (
          <div className="report-modal-overlay">
            <div className="report-modal-content">
              <div className='report-form'>
                <h2>Report Post</h2>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Enter reason for reporting..."
                  />
                  <div className="report-actions">
                    <button className='submit-report' onClick={handleReportSubmit}>Submit</button>
                    <button className='cancel' onClick={() => setShowReportModal(false)}>Cancel</button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
        );
    };

export default PostCard;
