import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode(storedToken);
      setUser(decoded);
      setToken(storedToken);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/users/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      setToken(token);

      // Navigate based on user role
      if (decoded.role === 'admin') {
        navigate('/users');
      } else if (decoded.role === 'employee') {
        navigate('/skills');
      }
    } catch (error) {
      alert('Invalid email or password');
      console.error('Login failed:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await axios.post('http://localhost:5001/users/register', { name, email, password, role });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };