import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, ArrowLeft, Filter } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { format } from "date-fns";
import { Card } from "../../components/ui";

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
  const [filter, setFilter] = useState("all");
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedNotifications(
      selectedNotifications.length === notifications.length
        ? []
        : notifications.map((n) => n._id)
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-5 md:mt-18">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Notifications
            </h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up!"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="self-start sm:self-auto p-2 border rounded-lg hover:bg-gray-50"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg mb-4">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 p-3 bg-blue-50 rounded-lg mb-4">
          <span className="text-sm font-medium text-blue-700">
            {selectedNotifications.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                selectedNotifications.forEach(markAsRead);
                setSelectedNotifications([]);
              }}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg"
            >
              <Check size={14} className="inline mr-1" /> Mark read
            </button>
            <button
              onClick={() => {
                selectedNotifications.forEach(deleteNotification);
                setSelectedNotifications([]);
              }}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg"
            >
              <Trash2 size={14} className="inline mr-1" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const { icon, color } = getNotificationIcon(n.type);
            return (
              <Card variant="subtle"
                key={n._id}
                className={`p-4 rounded-xl border ${
                  n.read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(n._id)}
                    onChange={() => handleSelect(n._id)}
                  />

                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${color}`}
                  >
                    {icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <div>
                        <h4 className="font-medium">{n.title}</h4>
                        <p className="text-sm text-gray-600">{n.message}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(n.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>

                    {n.data && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {Object.entries(n.data).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-gray-500">{k}:</span>
                            <span className="ml-1 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="px-3 py-1 text-xs bg-gray-100 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={notifications.length < 20}
            className="px-4 py-2 border rounded-lg"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;