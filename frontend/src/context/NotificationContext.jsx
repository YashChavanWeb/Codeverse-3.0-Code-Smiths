import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  const NOTIFICATION_URL = `${import.meta.env.VITE_BACKEND_URL}/notifications`;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, limit = 20, unreadOnly = false) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit, unreadOnly };
      const response = await axios.get(NOTIFICATION_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
      return response.data;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, NOTIFICATION_URL]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await axios.patch(`${NOTIFICATION_URL}/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await axios.patch(`${NOTIFICATION_URL}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return;

    try {
      await axios.delete(`${NOTIFICATION_URL}/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!token) return;

    try {
      await axios.delete(NOTIFICATION_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Setup SSE connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Setup SSE connection
    const sse = new EventSource(`${NOTIFICATION_URL}/stream`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    sse.onopen = () => {
      console.log("Notification SSE connection established");
    };

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "CONNECTED") {
          console.log("Connected to notification stream:", data.message);
          return;
        }

        // Handle new notification
        addNotification(data);
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    sse.onerror = (err) => {
      console.error("Notification SSE error:", err);
      sse.close();
    };

    setEventSource(sse);

    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [isAuthenticated, token, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};