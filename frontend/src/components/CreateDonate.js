import React, { useState } from 'react';
import './createpost.css';

const CreateDonate = ({ onPost , onClose}) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!bookTitle || !author || !description) {
      alert("Please fill in all fields.");
      return;
    }

    const post = { bookTitle, author, description, type: 'donate' };
    onPost(post);  // Call the parent function to handle post creation
    setBookTitle('');
    setAuthor('');
    setDescription('');
    onClose();
  };

  return (
    <div className='modal-overlay'>
        <div className='modal-content'>
            <span className="close-btn" onClick={onClose}>❌</span>
            <form className='book-post-form' onSubmit={handleSubmit}>
                <h2>Donate a Book</h2>
                <input
                    type="text"
                    placeholder="Book Title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <textarea
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
              />
              <button type="submit">Post Donate</button>
            </form>
        </div>
    </div>
  );
};

export default CreateDonate;
