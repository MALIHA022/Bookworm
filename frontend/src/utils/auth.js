import axios from 'axios';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Registration failed');
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Login failed');
  }
};
