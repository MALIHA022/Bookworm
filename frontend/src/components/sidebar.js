// Sidebar.js
import React from 'react';
import './sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/explore', icon: '🔍', label: 'Explore' },
    { to: '/bookmarks', icon: '📖', label: 'Bookmarks' },
    { to: '/favorites', icon: '❤️', label: 'Favorites' },
    { to: '/usersettings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className="sidebar-icon">
          <span role="img" aria-label={link.label}>{link.icon}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;

// import React from "react";
// import { NavLink } from "react-router-dom";

// export default function Sidebar() {
//     return (
//         <div className="sidebar">
//             <NavLink to="/home">Home</NavLink>
//             <NavLink to="/bookmarks">Bookmarked Posts</NavLink>
//             <NavLink to="/likes">Liked Posts</NavLink>
//             <NavLink to="/settings">Account Settings</NavLink>
//         </div>
//     );
// }
