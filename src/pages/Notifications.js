import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const NotificationsContainer = styled.div`
  margin: 2rem;
  text-align: center;
`;

const NotificationItem = styled.div`
  background-color: ${({ read }) => (read ? '#f0f0f0' : '#fff')};
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer; /* Add cursor pointer to indicate it's clickable */
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  margin: 1rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #333;
  color: white;
  &:hover {
    background-color: #555;
  }
`;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5001/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5001/notifications/markAllAsRead', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5001/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationsContainer>
      <h1>Notifications</h1>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification._id} 
          read={notification.read} 
          onClick={() => markAsRead(notification._id)}
        >
          {notification.message}
        </NotificationItem>
      ))}
    </NotificationsContainer>
  );
};

export default Notifications;