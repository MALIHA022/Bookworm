// src/components/CoverPageNavbar.js
import React, { useState } from "react";
import LoginModal from "./Login";
import SignupModal from "./Signup";
import "./navbar.css";

export default function CoverPageNavbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <nav className="navbar">
       <div className="navbar-logo">
         <img src='/logo.png' alt="BookWorm Logo" />
       <div className="navbar-title">BookWorm</div>
       </div>
        <div className="navbar-right">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowSignup(true)}>Sign Up</button>
        </div>
      </nav>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          openSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </>
  );
}
