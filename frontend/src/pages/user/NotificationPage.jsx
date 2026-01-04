import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, ArrowLeft, Filter } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { format } from "date-fns";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications(page, 20, filter === "unread");
  }, [page, filter, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PRICE_CHANGE":
        return { icon: "💰", color: "bg-blue-100 text-blue-600" };
      case "STOCK_CHANGE":
        return { icon: "📦", color: "bg-yellow-100 text-yellow-600" };
      case "AVAILABILITY_CHANGE":
        return { icon: "✅", color: "bg-green-100 text-green-600" };
      case "NEW_PRODUCT":
        return { icon: "🆕", color: "bg-purple-100 text-purple-600" };
      case "DEMAND_ALERT":
        return { icon: "🔥", color: "bg-red-100 text-red-600" };
      default:
        return { icon: "📢", color: "bg-gray-100 text-gray-600" };
    }
  };

  const handleSelect = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n._id));
    }
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach((id) => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`
      )
    ) {
      selectedNotifications.forEach((id) => deleteNotification(id));
      setSelectedNotifications([]);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
              <p className="text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-sm ${filter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-full text-sm ${filter === "unread"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border"
                }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-1 rounded-full text-sm ${filter === "read"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border"
                }`}
            >
              Read
            </button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedNotifications.length === notifications.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkSelectedAsRead}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <Check size={14} className="inline mr-1" /> Mark as read
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 size={14} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Global Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to clear all notifications?"
                    )
                  ) {
                    clearAllNotifications();
                  }
                }}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No notifications
          </h3>
          <p className="text-gray-500">
            {filter === "unread"
              ? "You have no unread notifications"
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon, color } = getNotificationIcon(notification.type);
            return (
              <div
                key={notification._id}
                className={`p-4 rounded-xl border transition-all hover:shadow-sm ${!notification.read
                    ? "bg-white border-gray-300"
                    : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleSelect(notification._id)}
                    className="mt-1"
                  />

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${color}`}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4
                          className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"
                            }`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">
                          {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                        </span>
                        {notification.important && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                              Important
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Data */}
                    {notification.data && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {notification.data.productName && (
                            <div>
                              <span className="text-gray-500">Product:</span>
                              <span className="ml-2 font-medium">
                                {notification.data.productName}
                              </span>
                            </div>
                          )}
                          {notification.data.vendorName && (
                            <div>
                              <span className="text-gray-500">Vendor:</span>
                              <span className="ml-2 font-medium">
                                {notification.data.vendorName}
                              </span>
                            </div>
                          )}
                          {notification.data.oldValue !== undefined && (
                            <div>
                              <span className="text-gray-500">From:</span>
                              <span className="ml-2 font-medium">
                                {notification.data.oldValue}
                              </span>
                            </div>
                          )}
                          {notification.data.newValue !== undefined && (
                            <div>
                              <span className="text-gray-500">To:</span>
                              <span className="ml-2 font-medium">
                                {notification.data.newValue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this notification?"
                            )
                          ) {
                            deleteNotification(notification._id);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={notifications.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;