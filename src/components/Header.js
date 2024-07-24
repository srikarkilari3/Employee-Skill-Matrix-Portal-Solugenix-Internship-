import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';
import logo from '../LOGO1.png'; // Ensure this path is correct

const Header = () => {
  const { user, logout, token } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const handleNotificationsClick = async () => {
    try {
      await axios.put('http://localhost:5001/notifications/markAllAsRead', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUnreadCount(0); // Update the unread count immediately
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5001/notifications/unread-count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    if (token) {
      fetchUnreadNotifications();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <nav>
        <ul className="nav-left">
          <li>
            <Link to="/">
              <img src={logo} alt="Logo" className="logo" />
            </Link>
          </li>
          {user && user.role === 'admin' && (
            <>
              <li><Link to="/users">Users</Link></li>
              <li><Link to="/skills/configure">Configure Skills</Link></li>
              <li><Link to="/manage-employees">Manage Employees</Link></li>
              <li><Link to="/skill-matrix">Skill Matrix</Link></li>
            </>
          )}
          {user && user.role === 'employee' && (
            <>
              <li><Link to="/skills">Skills</Link></li>
            </>
          )}
        </ul>
        <ul className="nav-right">
          {user ? (
            <>
              <li>Welcome, {user.name}</li>
              <li className="notification-icon">
                <Link to="/notifications" onClick={handleNotificationsClick}>
                  <FaBell />
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </Link>
              </li>
              <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;