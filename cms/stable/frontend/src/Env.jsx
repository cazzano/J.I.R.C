import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/admin');  // Redirect to Admin page instead of Hello
        return true;
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data);
      return false;
    }
  };

  const validateToken = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/validate-token', { token });
      
      if (response.data.valid) {
        setIsAuthenticated(true);
        navigate('/admin');  // Redirect to Admin page if token is valid
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return { isAuthenticated, login, logout };
}
