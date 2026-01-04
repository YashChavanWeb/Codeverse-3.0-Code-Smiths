import express from "express";
import verifyUser from "../auth/authMiddleware.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "./notificationController.js";
import notificationEvents from "../utils/notificationEvents.js";

const router = express.Router();

// --- Protected Routes (All authenticated users) ---

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications with pagination
 */
router.get("/", verifyUser, getUserNotifications);

/**
 * @route   GET /api/v1/notifications/stream
 * @desc    SSE endpoint for real-time notifications
 */
router.get("/stream", verifyUser, (req, res) => {
  const userId = req.user._id.toString();
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  // Flush headers immediately
  res.flushHeaders();
  
  const sendNotification = (data) => {
    // Only send notifications for this specific user
    if (data.userId === userId) {
      res.write(`data: ${JSON.stringify(data.notification)}\n\n`);
    }
  };
  
  // Listen for new notifications
  notificationEvents.on("newNotification", sendNotification);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", userId })}\n\n`);
  
  // Keep-alive ping
  const keepAliveInterval = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 30000);
  
  // Handle client disconnect
  req.on("close", () => {
    clearInterval(keepAliveInterval);
    notificationEvents.off("newNotification", sendNotification);
    console.log(`User ${userId} disconnected from notification stream`);
    res.end();
  });
  
  // Handle errors
  req.on("error", (err) => {
    clearInterval(keepAliveInterval);
    console.error(`SSE connection error for user ${userId}:`, err);
    notificationEvents.off("newNotification", sendNotification);
    res.end();
  });
});

/**
 * @route   PATCH /api/v1/notifications/:notificationId/read
 * @desc    Mark a notification as read
 */
router.patch("/:notificationId/read", verifyUser, markAsRead);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 */
router.patch("/read-all", verifyUser, markAllAsRead);

/**
 * @route   DELETE /api/v1/notifications/:notificationId
 * @desc    Delete a specific notification
 */
router.delete("/:notificationId", verifyUser, deleteNotification);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Clear all notifications for the user
 */
router.delete("/", verifyUser, clearAllNotifications);

export default router;