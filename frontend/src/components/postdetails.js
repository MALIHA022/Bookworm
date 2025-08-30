import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './postdetails.css';

const PostDetails = ({ post }) => {
  return (
    <div className='post-details'>
      <div className="details">
        <section className='user-info'>
        <div className='post-header'>
          <span className={post.type}>Post Type: {post.type}</span>
          <h4> Posted By: {post.user.firstName} {post.user.lastName}</h4>
          <h4> Total Likes: {post.likes}</h4>
        </div>
        </section>
 
        <section className='post-info'>
            <div className='post-body'>
              <div className='post-title'>
                <p><strong>Book Title: </strong>{post.title || post.bookTitle}</p>
              </div>
              <div className='post-author'>
                  <p><strong>Book Author:</strong> {post.author}</p>
              </div>
              <div className='post-content'>
                  <p>"{post.content || post.description}"</p>
              </div>
            </div>
        </section>
    </div>
    </div>
    );
};

export default PostDetails;
