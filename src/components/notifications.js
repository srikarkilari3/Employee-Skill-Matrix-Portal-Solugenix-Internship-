// src/components/Notifications.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5001/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5001/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications.map(notification => (
          <li key={notification._id} style={{ background: notification.read ? 'lightgray' : 'white' }}>
            {notification.message}
            {!notification.read && <button onClick={() => markAsRead(notification._id)}>Mark as read</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;