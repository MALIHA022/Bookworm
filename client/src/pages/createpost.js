import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/posts', formData);
      navigate('/'); // redirect to home page after successful post
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <div className="create-post">
      <h2>Create New Book Post</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" value={formData.title} onChange={handleChange} placeholder="Book Title" required />
        <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreatePost;
