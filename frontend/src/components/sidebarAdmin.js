// Sidebar.js
import React from 'react';
import './sidebar.css';
import { NavLink, Link } from 'react-router-dom';

const SidebarAdmin = () => {
  const links = [
    { to: '/dashboard/admin', icon: 'Home', label: 'Home' },
    { to: '/users/admin', icon: 'Users', label: 'Users' },
    { to: '/posts/admin', icon: 'Posts', label: 'Posts' },
    { to: '/reports/admin', icon: 'Reports', label: 'Reports' },
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

