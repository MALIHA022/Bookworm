import React, { useState, useContext } from "react";
import LoginModal from "../components/Login";
import SignupModal from "../components/Signup";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import "./cover.css";

export default function Cover() {
    const user = useContext(AuthContext);
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    if (user) return navigate("/home");

    return (
        <div className="cover-page">
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src='/logo.png' alt="BookWorm Logo" />
                    <div className="navbar-title">BookWorm</div>
                </div>
                <div className="navbar-right">
                    <button onClick={() => setShowLogin(true)}>Login</button>
                    <button onClick={() => setShowSignup(true)}>Signup</button>
                </div>
            </nav>

            <div className="cover-content" >
                <img src="/cover-image.jpg" alt="Cover" />
                <h1>Interact and enjoy with likeminded bookworms</h1>
            </div>

            <footer className="cover-footer"
                style={{ marginTop: "50px", textAlign: "center" }}>
                <a href="#contact">Contact Us</a>
                <a href="#feedback">Give Feedback</a>
            </footer>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
        </div>
    );
}
