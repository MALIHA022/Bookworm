import React, { useState } from 'react';
import { registerUser, loginUser } from '../utils/auth'; // Ensure correct import
import axios from 'axios';
import './modal.css';

const AuthModal = ({ type, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const userData = { firstName, lastName, email, password, gender, dob };

    try {
      let data;
      if (type === 'register') {
        const res = await axios.post('http://localhost:5000/api/auth/register', userData);
        data = res.data; // Now this will have { token, user, message }
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        data = res.data;
      }

      // Storing the token and user information in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Success callback
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>❌</span>
        <form className="default-form" onSubmit={handleSubmit}>
            <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
            {type === 'register' && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
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
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </>
            )}
            
            {type === 'login' && (
              <>
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
              </>
            )}

            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button className="submit" type="submit">
              {type === 'login' ? 'Login' : 'Register'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
