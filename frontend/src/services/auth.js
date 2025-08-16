// services/auth.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // your backend

export const loginUser = (user) => axios.post(`${API_URL}/login`, user);
export const signupUser = (user) => axios.post(`${API_URL}/signup`, user);
