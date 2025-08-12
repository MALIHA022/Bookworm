import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import "./modal.css";

export default function Login({ onClose }) {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            
            if (res.ok) {
                login(data);
                onClose();
                navigate("/");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError("Something went wrong");
        }
    };
    const handleClose = () => {
        navigate(-1);
    };
    return (
        // <div className="modal">
        //     <div className="modal-content">
        //         <span className="close" onClick={onClose}>&times;</span>
        //         <h2>Login</h2>
        //         {error && <p className="error">{error}</p>}
        //         <form onSubmit={handleLogin}>
        //           <input type="email" placeholder="Email" value={email}
        //                 onChange={(e) => setEmail(e.target.value)} required />
        //           <input type="password" placeholder="Password" value={password}
        //                 onChange={(e) => setPassword(e.target.value)} required />
        //           <button type="submit">Login</button>
        //         </form>
        //     </div>
        // </div>
        

        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={handleClose}>❌</button>
                <form className="default-form" onSubmit={handleLogin}>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} required/>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} required/>
                    <button onClick={handleLogin}>Login</button>
                </form>
    </div>
    </div>
    );
}
