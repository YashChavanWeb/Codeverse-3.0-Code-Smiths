import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        createdAt: Date.now(), // ✅ FIXED: ALWAYS VALID
        read: isPanelOpen,
      },
      ...prev,
    ]);
  };

  // Dummy real-time notifications (every 5 seconds)
  useEffect(() => {
    const types = [
      "PRICE_UPDATE",
      "STOCK_UPDATE",
      "AVAILABILITY_UPDATE",
      "TITLE_UPDATE",
      "ERROR",
    ];

    const messages = [
      { title: "Price Updated", message: "Apple price updated to ₹120/kg" },
      { title: "Stock Updated", message: "Tomato stock increased by 50 units" },
      { title: "Availability", message: "Banana is back in stock" },
      { title: "Title Updated", message: "Product name updated successfully" },
      { title: "Upload Failed", message: "CSV upload failed for product X" },
    ];

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * types.length);

      addNotification({
        id: Date.now(),
        type: types[index],
        title: messages[index].title,
        message: messages[index].message,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPanelOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        setIsPanelOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
