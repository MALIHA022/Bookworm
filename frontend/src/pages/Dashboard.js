import React from 'react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>This is your dashboard.</p>
    </div>
  );
};

export default Dashboard;
