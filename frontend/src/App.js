// // import React from 'react';
// // import { useState, useEffect } from 'react';
// // import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// // import Sidebar from './components/sidebar';
// // import Navbar from './components/navbar';
// // import Login from './components/Login';
// // import Signup from './components/Signup';
// // import PrivateRoute from './components/PrivateRoute';

// // import Cover from './pages/cover';
// // import Home from './pages/home';
// // import Favorites from './pages/favourites';
// // import Bookmarks from './pages/bookmarked';
// // import CreatePost from './pages/createpostpage';

// // function App() {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const state = location.state;

// //   const [posts, setPosts] = useState([]);

// //   // Load posts from backend
// //   useEffect(() => {
// //     const fetchPosts = async () => {
// //       try {
// //         const res = await fetch('http://localhost:5000/api/books'); // Adjust port if needed
// //         const data = await res.json();
// //         setPosts(data);
// //       } catch (err) {
// //         console.error("Failed to fetch posts", err);
// //       }
// //     };

// //     fetchPosts();
// //   }, []);

// //     // Add new post
// //   const handleCreatePost = async (post) => {
// //     try {
// //       const res = await fetch('http://localhost:5000/api/books', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(post),
// //       });
// //       const data = await res.json();
// //       setPosts(prev => [data, ...prev]); // Update UI
// //       navigate('/'); // Close modal and go back to homepage
// //     } catch (err) {
// //       alert('Failed to post book');
// //     }
// //   };

// //   // Handle login
// //   const handleLogin = async (credentials) => {
// //     try {
// //       const res = await fetch('http://localhost:5000/api/auth/login', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(credentials),
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         // Save user data and navigate
// //         Login(data.user);
// //         navigate('/home');
// //       } else {
// //         alert(data.message || 'Login failed');
// //       }
// //     } catch (err) {
// //       console.error("Login error:", err);
// //     }
// //   };

// //   //handle signup
// //   const handleSignup = async (userData) => {
// //     try {
// //       const res = await fetch('http://localhost:5000/api/auth/signup', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(userData),
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         // Save user data and navigate
// //         Signup(data.user)
// //         navigate('/home');
// //       } else {
// //         alert(data.message || 'Signup failed');
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err);
// //     }
// //   };

// //   return (
// //     <>
// //       <Sidebar />
// //       <Navbar />
// //       <div className="app-content">
// //         <Routes location={state?.backgroundLocation || location}>
          
// //           <Route path="/" element={<Cover />} />
// //           <Route path="/login" element={<Login onPost={handleLogin} />} />
// //           <Route path="/signup" element={<Signup onPost={handleSignup} />} />
// //           <Route path="/home" element={<PrivateRoute><Home posts={posts} /></PrivateRoute>} />
// //           <Route path="/explore" element={<h1>Explore</h1>} />
// //           <Route path="/bookmarks" element={<Bookmarks userId={state?.userId} />} />
// //           <Route path="/favorites" element={<Favorites userId={state?.userId} />} />
// //           <Route path="/settings" element={<h1>Settings</h1>} />
// //           <Route path="/create-post" element={<CreatePost />} />
// //         </Routes>

// //         {/* Modal route */}
// //         {state?.backgroundLocation && (
// //           <Routes>
// //             <Route path="/create-post" element={<CreatePost onPost={handleCreatePost} />} />
// //           </Routes>
// //         )}
// //       </div>
// //     </>
// //   );
// // }

// // export default App;


// // src/App.js
// import React from 'react';
// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Navbar from './components/navbarcover';
// import Cover from './pages/cover'; 
// import  Login from './pages/Login';
// import Register from './pages/Register';
// import DashboardLayout from './pages/DashboardLayout';
// import Favorites from './pages/favourites';
// // import Bookmarks from './pages/bookmarked';
// import CreatePost from "./pages/createpostpage"; 
// // import Login from "./components/Login";
// // import Signup from "./components/Signup";

// function App() {
//   const [user, setUser] = useState(null);

//   // Restore user from localStorage
//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser && savedUser !== "undefined") {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch {
//         setUser(null); // In case of corrupted JSON, fallback to null
//       }
//     } else {
//       setUser(null);
//     }
//   }, []);

//   // const handleLogin = (credentials) => {
//   //   // This will send the login request to backend
//   //   fetch("http://localhost:5000/api/auth/login", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify(credentials)
//   //   })
//   //   .then(res => res.json())
//   //   .then(data => console.log(data))
//   //   .catch(err => console.error(err));
//   // };

//   // const handleSignup = (userData) => {
//   //   // This will send the signup request to backend
//   //   fetch("http://localhost:5000/api/auth/signup", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify(userData)
//   //   })
//   //   .then(res => res.json())
//   //   .then(data => console.log(data))
//   //   .catch(err => console.error(err));
//   // };
//   // Log out function
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//   };

//   // Update: after login/register, save user to both state and localStorage
//   const handleLogin = (userObj) => {
//     setUser(userObj);
//     localStorage.setItem('user', JSON.stringify(userObj));
//   };


//   // const handleCreatePost = (post) => {
//   //   // This will handle the post creation
//   //   fetch("http://localhost:5000/api/posts", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify(post)
//   //   })
//   //   .then(res => res.json())
//   //   .then(data => console.log(data))
//   //   .catch(err => console.error(err));
//   // };

  
// //   return (
// //       <div className="app-content">
// //         <Routes location={state?.backgroundLocation || location}>
          
// //           <Route path="/" element={<Cover />} />
// //           <Route path="/login" element={<Login onPost={handleLogin} />} />
// //           <Route path="/signup" element={<Signup onPost={handleSignup} />} />
// //           <Route path="/create-post" element={<CreatePost />} />
// //         </Routes>

// //         {/* Modal route */}
// //         {state?.backgroundLocation && (
// //           <Routes>
// //             <Route path="/create-post" element={<CreatePost onPost={handleCreatePost} />} />
// //           </Routes>
// //         )}
// //       </div>
// //   );
// // };

// // export default App;

//   return (
//     <Router>
//       <Navbar user={user} onLogout={handleLogout} />
//       <Routes>
//         <Route path="/" element={<Cover onLogin={handleLogin} />} />

//         <Route path="/login" element={<Login onLogin={handleLogin} />} />
//         <Route path="/register" element={<Register onRegister={handleLogin} />} />
//         <Route path="/dashboard/*" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
//           <Route index element={<DashboardLayout user={user} />} />
//           {/* <Route path="want-to-read" element={<WantToRead user={user} />} /> */}
//           {/* <Route path="finished" element={<Finished user={user} />} /> */}
//           {/* <Route path="currently-reading" element={<CurrentlyReading user={user} />} /> */}
//           <Route path="favorites" element={<Favorites user={user} />} />
//           {/* <Route path="account-settings" element={<AccountSettings user={user} onLogout={handleLogout} />} /> */}
//         </Route>
//         <Route path="*" element={<Cover />} />
//       </Routes>
//     </Router>
//   );
// }

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';

const App = () => {
  return (
    <Router>  {/* Only one Router here */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
