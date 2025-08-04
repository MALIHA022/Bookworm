import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createpostpage.css';

const CreatePost = ({ onPost }) => {
  const navigate = useNavigate();
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
    onPost(post); 
    setTitle('');
    setAuthor('');
    setContent('');
    navigate(-1);
  };

  const handleClose = () => {
  navigate(-1);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <button className="close-btn" onClick={handleClose}>❌</button>
        <form className="book-post-form" onSubmit={handleSubmit}>
          <h2>Share a Book</h2>
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
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
