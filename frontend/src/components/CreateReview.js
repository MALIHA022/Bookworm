import React, { useState } from 'react';
import './createpost.css';

const CreateReview = ({ onPost, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !author || !content) {
      alert("Please fill in all fields.");
      return;
    }

    const post = { title, author, content };
    onPost(post);  // Call the parent function to handle post creation
    setTitle('');
    setAuthor('');
    setContent('');
    onClose();  // Close the modal after posting
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <span className="close-btn" onClick={onClose}>❌</span>
        <form className='book-post-form' onSubmit={handleSubmit}>
          <h2>Share a Book Review</h2>
          <input
            type="text"
            placeholder="Book Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <textarea
            placeholder="Description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
          />
          <button type="submit">Post Review</button>
        </form>
      </div>
    </div>
  );
};

export default CreateReview;
