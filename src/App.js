import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Users from './pages/Users';
import Skills from './pages/Skills';
import ConfigureSkills from './pages/ConfigureSkills';
import SkillMatrix from './pages/SkillMatrix';
import ManageEmployees from './pages/ManageEmployees';
import Register from './pages/Register';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './GlobalStyles';

const App = () => (
  <Router>
    <AuthProvider>
      <GlobalStyles />
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/users"
            element={<ProtectedRoute element={<Users />} adminOnly />}
          />
          <Route
            path="/skills"
            element={<ProtectedRoute element={<Skills />} />}
          />
          <Route
            path="/skills/configure"
            element={<ProtectedRoute element={<ConfigureSkills />} adminOnly />}
          />
          <Route
            path="/skill-matrix"
            element={<ProtectedRoute element={<SkillMatrix />} adminOnly />}
          />
          <Route
            path="/manage-employees"
            element={<ProtectedRoute element={<ManageEmployees />} adminOnly />}
          />
          <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        </Routes>
      </div>
    </AuthProvider>
  </Router>
);

export default App;