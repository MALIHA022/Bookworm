import React, { useState } from 'react';
import { registerUser, loginUser } from '../utils/auth';

import axios from 'axios';
import "./modal.css"

const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


const AuthModal = ({ type, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userData = { username, email, password };
    try {
      let data;
      if (type === 'register') {
        data = await registerUser(userData);
      } else {
        data = await loginUser(userData);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSuccess();  // Callback to close the modal and perform further actions like redirecting
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="modal-overlay">
    <div className="modal-content">
        <span className="close-btn" onClick={onClose}>❌</span>
      <form className= "default-form" onSubmit={handleSubmit}>
        <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
        {type === 'register' && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button className = "submit"  type="submit">{type === 'login' ? 'Login' : 'Register'}</button>
      </form>
      </div>
    </div>
  );
};

export default AuthModal;
