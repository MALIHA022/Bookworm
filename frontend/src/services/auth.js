// services/auth.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // your backend

export const login = (user) => axios.post(`${API_URL}/login`, user);
export const register = (user) => axios.post(`${API_URL}/register`, user);
