// Sidebar.js
import React from 'react';
import './sidebar.css';
import { NavLink } from 'react-router-dom';

const SidebarAdmin = () => {
  const links = [
    { to: '/dashboard', icon: 'Home', label: 'Home' },
    { to: '/allusers', icon: 'Users', label: 'Users' },
    { to: '/allposts', icon: 'Posts', label: 'Posts' },
  ];

  return (
    <div className="sidebar-admin">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className="admin-icon">
          <span role="img" aria-label={link.label}>{link.icon}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default SidebarAdmin;

