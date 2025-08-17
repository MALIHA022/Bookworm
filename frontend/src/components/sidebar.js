// Sidebar.js
import React from 'react';
import './sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/explore', icon: '🔍', label: 'Explore' },
    { to: '/bookmarks', icon: '📖', label: 'Bookmarks' },
    { to: '/wishlist', icon: '📋', label: 'Wishlist' },
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

