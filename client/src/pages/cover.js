// import React, { useState, useContext, useEffect } from "react";
// import LoginModal from "../components/Login";
// import SignupModal from "../components/Signup";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/authcontext";
// import "./cover.css";

// export default function Cover() {
//     const user = useContext(AuthContext);
//     const navigate = useNavigate();
//     const [showLogin, setShowLogin] = useState(false);
//     const [showSignup, setShowSignup] = useState(false);

//     useEffect(() => {
//         if (user) {
//             navigate("/home");
//     }
//     }, [user, navigate]);

//     return (
//         <div className="cover-page">
//             <nav className="cover-navbar">
//                 <div className="cover-navbar-logo">
//                     <img src='/logo.png' alt="BookWorm Logo" />
//                     <div className="navbar-title">BookWorm</div>
//                 </div>
//                 <div className="cover-navbar-right">
//                     <button onClick={() => setShowLogin(true)}>Login</button>
//                     <button onClick={() => setShowSignup(true)}>Signup</button>
//                 </div>
//             </nav>

//             <div className="cover-content" >
//                 <img src="/cover-image.jpg" alt="Cover" />
//                 <h1>Interact and enjoy with likeminded bookworms</h1>
//             </div>

//             <footer className="cover-footer"
//                 style={{ marginTop: "50px", textAlign: "center" }}>
//                 <a href="#contact">Contact Us</a>
//                 <a href="#feedback">Give Feedback</a>
//             </footer>

//             {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
//             {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
//         </div>
//     );
// }
// pages/CoverPage.js
import React from "react";
import Navbar from "../components/navbarcover";
import "./cover.css"; 

const CoverPage = () => {
  return (
    <div className="cover-page">
      <Navbar />
      <div className="middle-section">
                 <img src='/cover_bg.png' alt="Cover" />
                 <p> "Reading brings us unknown friends." - Honoré de Balzac <br/>Find and connect with likeminded bookworms and share your thoughts!</p>
      </div>
           <footer className="cover-footer">
                <a href="#contact">Contact Us  </a>contact@bookworm.com
            </footer>
    </div>
  );
};

export default CoverPage;
