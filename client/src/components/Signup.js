import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import "./modal.css";

export default function Signup({ onClose }) {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
          
            const data = await res.json();
          
            if (res.ok) {
                login(data);
                onClose();
                navigate("/home");
            } else {
                setError(data.message || "Signup failed!");
            }
            } catch (err) {
              console.error(err);
              setError("Something went wrong!");
            }
    };  
    const handleClose = () => {
        navigate(-1);
    };
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={handleClose}>❌</button>
                <form className="default-form" onSubmit={handleSignup}>
                    <h2>Signup</h2>
                    {error && <p className="error">{error}</p>}
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)} required />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} required />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Signup</button>
                </form>
            </div>
        </div>
    );  
}       
