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
  
  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');

  // Activation request states
  const [showActivationRequest, setShowActivationRequest] = useState(false);
  const [activationEmail, setActivationEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
  
    try {
      let res, data;
    
      if (type === 'register') {
        res = await axios.post('http://localhost:5000/api/auth/register', {
          firstName,
          lastName,
          email,
          password,
          gender,
          dob
        });
      } else {
        // check if admin email
        const ADMIN_EMAIL = 'admin@bookworm.local';
        const endpoint =
          email.trim().toLowerCase() === ADMIN_EMAIL
            ? 'http://localhost:5000/api/auth/admin/login'
            : 'http://localhost:5000/api/auth/login';
      
        res = await axios.post(endpoint, { email, password });
      }
    
      data = res.data;
      console.log("Login/Register response:", data);
    
      // Store token + user in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          const user = { email, password };
          localStorage.setItem("user", JSON.stringify(user));
        }
        console.log("User saved to localStorage:", JSON.parse(localStorage.getItem("user")));
      }
    
      // Success callback
      onSuccess();
    
      // Redirect by role
      const role = data.user?.role || 'user';
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    
    } catch (error) {
      setError(error.response?.data?.error || 'An unexpected error occurred.');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    console.log('Attempting forgot password for email:', email);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      console.log('Forgot password response:', res.data);
      setSuccessMessage(`Password reset token generated: ${res.data.resetToken} (Valid for 1 hour)`);
      setShowForgotPassword(false);
      setShowResetPassword(true);
    } catch (error) {
      console.error('Forgot password error details:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to generate reset token');
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        resetToken,
        newPassword
      });
      setSuccessMessage('Password reset successfully! You can now login with your new password.');
      setShowResetPassword(false);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (changeNewPassword !== changeConfirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/change-password', {
        currentPassword,
        newPassword: changeNewPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to change password');
    }
  };

  // Handle activation request
  const handleActivationRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      console.log('Sending activation request for email:', activationEmail);
      
      const res = await axios.post('http://localhost:5000/api/auth/request-activation', { 
        email: activationEmail 
      });
      
      console.log('Activation request response:', res.data);
      setSuccessMessage('Activation request sent successfully! Admin will review your request.');
      setShowActivationRequest(false);
      setActivationEmail('');
    } catch (error) {
      console.error('Activation request error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send activation request';
      setError(`Activation request failed: ${errorMessage}`);
    }
  };

  // Reset form states
  const resetFormStates = () => {
    setError('');
    setSuccessMessage('');
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setShowChangePassword(false);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setShowActivationRequest(false);
    setActivationEmail('');
  };

  // Close modal and reset states
  const handleClose = () => {
    resetFormStates();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={handleClose}>❌</span>
        
        {!showForgotPassword && !showResetPassword && !showChangePassword && !showActivationRequest && (
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

            <button className="submit" type="submit">
              {type === 'login' ? 'Login' : 'Register'}
            </button>

            {error && (
              <div className="error-message">
                {error}
                {error.includes('Account suspended for suspicious activity') && (
                  <div className="activation-request-section">
                    <p>Your account has been suspended. You can request activation from an administrator.</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowActivationRequest(true);
                        setActivationEmail(email); // Pre-fill with current email
                      }}
                      className="activation-request-btn"
                    >
                      Request Activation
                    </button>
                  </div>
                )}
              </div>
            )}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <div className="switch-auth-type">
              {type === 'login' && (
                  <div className="forgot-password-link">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)}
                      className="link-button"
                    >
                      Forgot Password?
                    </button>
                  </div>
              )}

              {type === 'login' && (
                <div className="change-password-link">
                  <button 
                    type="button" 
                    onClick={() => setShowChangePassword(true)}
                    className="link-button"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && (
          <form className="default-form" onSubmit={handleForgotPassword}>
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a password reset token</p>
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <button className="submit" type="submit">Send Reset Token</button>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(false)}
              className="secondary-button"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {showResetPassword && (
          <form className="default-form" onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>
            <p>Enter the reset token and your new password</p>
            
            <input
              type="text"
              placeholder="Reset Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <button className="submit" type="submit">Reset Password</button>
            <button 
              type="button" 
              onClick={() => setShowResetPassword(false)}
              className="secondary-button"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Change Password Form */}
        {showChangePassword && (
          <form className="default-form" onSubmit={handleChangePassword}>
            <h2>Change Password</h2>
            <p>Enter your current password and new password</p>
            
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={changeNewPassword}
              onChange={(e) => setChangeNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={changeConfirmPassword}
              onChange={(e) => setChangeConfirmPassword(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <button className="submit" type="submit">Change Password</button>
            <button 
              type="button" 
              onClick={() => setShowChangePassword(false)}
              className="secondary-button"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Activation Request Form */}
        {showActivationRequest && (
          <form className="default-form" onSubmit={handleActivationRequest}>
            <h2>Request Account Activation</h2>
            <p>Enter your email to request an account activation from the administrator.</p>
            
            <input
              type="email"
              placeholder="Email"
              value={activationEmail}
              onChange={(e) => setActivationEmail(e.target.value)}
              required
            />

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <button className="submit" type="submit">Send Activation Request</button>
            <button 
              type="button" 
              onClick={() => setShowActivationRequest(false)}
              className="secondary-button"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
