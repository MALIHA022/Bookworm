// cover page
import React, { useState } from 'react';
import Navbar from '../components/navbar';
import AuthModal from '../components/authModal';
import "./home.css"

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [authType, setAuthType] = useState('');

  const openModal = (type) => {
    setAuthType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onSuccess = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <Navbar onLoginClick={() => openModal('login')} onRegisterClick={() => openModal('register')} />
      {modalOpen && <AuthModal type={authType} onClose={closeModal} onSuccess={onSuccess} />}
          <div className="middle-section">
              <img src='/cover_bg.png' alt="Cover" />
                 <p>"Reading brings us unknown friends." - Honoré de Balzac <br/>Find and connect with likeminded bookworms and share your thoughts!</p>
          </div>
          <footer className="cover-footer">
              <a href="#contact">Contact Us  </a>contact@bookworm.com
          </footer>
    </div>
  );
};

export default Home;
