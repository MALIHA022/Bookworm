import React, { createContext, useState, useEffect } from "react";

// Create context to hold the user data
export const AuthContext = createContext();

// AuthProvider will manage authentication state globally
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // User state to store authenticated user details

  // On app load, check if the token exists in localStorage to maintain session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userID");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const email = localStorage.getItem("email");
    const dob = localStorage.getItem("dob");

    if (token) {
      // If the token exists, set user data into state
      setUser({ token, role, userId, firstName, lastName, email, dob });
    }
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Login function: stores user data in localStorage and updates the user state
  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("userID", data.userID);
    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("lastName", data.lastName);
    localStorage.setItem("email", data.email);

    // Set user state with the response data
    setUser(data);
  };

  // Signup function: stores user data in localStorage and updates the user state
  const register = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("userID", data.userID);
    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("lastName", data.lastName);
    localStorage.setItem("email", data.email);

    // Set user state with the response data
    setUser(data);
  };

  // Logout function: clears localStorage and resets user state
  const logout = () => {
    localStorage.clear();  // Clear localStorage to log out user
    setUser(null);  // Reset user state to null
  };

  // Provide context to the children components
  return (
    <AuthContext.Provider value={{ user, login,register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
