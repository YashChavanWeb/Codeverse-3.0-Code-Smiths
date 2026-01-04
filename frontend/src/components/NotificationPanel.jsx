import React, { useEffect } from "react";
import { Alert } from "./ui/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";

const formatDateTime = (timestamp) => {
  if (!timestamp) return "Just now";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Just now";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationPanel = () => {
  const {
    notifications,
    markAllAsRead,
    setIsPanelOpen,
  } = useNotifications();

  useEffect(() => {
    setIsPanelOpen(true);
    markAllAsRead();

    return () => {
      setIsPanelOpen(false);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <Alert type={notif.type} dismissible>
                  <div className="flex flex-col gap-1">
                    <strong>{notif.title}</strong>
                    <span>{notif.message}</span>

                    <span className="text-xs text-gray-400">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                </Alert>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center text-sm">
              No notifications
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationPanel;
