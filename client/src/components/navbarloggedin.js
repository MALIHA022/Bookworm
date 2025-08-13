import React, { useState } from "react";
import "./navbar.css";

export default function LoggedInNavbar({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);

  function handleLogout() {
    // Clear user info from state / localStorage
    localStorage.removeItem("user");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <div className="logo">📚 BookWorm</div>
      <div className="nav-buttons">
        <button>Create Post</button>
        <button>Notifications</button>
        <div className="account-dropdown">
          <button onClick={() => setShowDropdown(!showDropdown)}>
            {user.name || "Account"} ▼
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <p>Email: {user.email}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
