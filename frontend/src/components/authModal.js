import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import './modal.css';

const AuthModal = ({ type, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let res, data;

      if (type === 'register') {
        res = await axios.post('http://localhost:5000/api/auth/register', {
          firstName, lastName, email, password, gender, dob
        });
      } else {
        res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      }

      data = res.data;
      console.log("Login/Register response:", data);

      // Store token + user in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);

        // If backend sends user info
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } 
        // If backend does NOT send user info
        else {
          const user = { email, password }; 
          localStorage.setItem("user", JSON.stringify(user));
        }

        console.log("User saved to localStorage:", JSON.parse(localStorage.getItem("user")));
      }

      // Success callback
      onSuccess();
      navigate('/dashboard');

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
