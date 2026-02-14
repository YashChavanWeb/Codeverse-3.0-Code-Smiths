import { Notification } from "./notificationModel.js";
import { User } from "../auth/authModel.js";
import { Product } from "../products/productModel.js";
import notificationEvents from "../utils/notificationEvents.js";

/* ---------- CREATE NOTIFICATION ---------- */
export const createNotification = async (userId, notificationData) => {
  try {
    const notification = await Notification.create({
      userId,
      ...notificationData,
    });

    // Emit real-time notification event
    notificationEvents.emit("newNotification", {
      userId,
      notification,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/* ---------- PRICE CHANGE NOTIFICATION ---------- */
export const createPriceChangeNotification = async (productId, oldPrice, newPrice) => {
  try {
    const product = await Product.findById(productId)
      .populate("vendor", "storeName")
      .populate("name");

    if (!product) return;

    // Find users who might be interested in this product
    // For now, create notifications for all users (you can refine this logic later)
    // Find users and other vendors who might be interested in this product
    // Exclude the vendor who owns the product
    const users = await User.find({
      role: { $in: ["user", "vendor"] },
      _id: { $ne: product.vendor._id }
    }).select("_id");

    const notifications = [];

    for (const user of users) {
      const priceChangePercentage = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);

      // Only notify for significant price changes (e.g., > 5%)
      if (priceChangePercentage >= 5) {
        const notification = await createNotification(user._id, {
          type: "PRICE_CHANGE",
          title: "Price Change Alert",
          message: `${product.name} price changed from ₹${oldPrice} to ₹${newPrice} at ${product.vendor.storeName}`,
          productId: product._id,
          vendorId: product.vendor._id,
          data: {
            oldValue: oldPrice,
            newValue: newPrice,
            productName: product.name,
            vendorName: product.vendor.storeName,
            changePercentage: priceChangePercentage.toFixed(1),
            direction: newPrice > oldPrice ? "increase" : "decrease",
          },
          important: priceChangePercentage > 20, // Mark as important if > 20% change
        });

        if (notification) notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating price change notification:", error);
  }
};

/* ---------- STOCK CHANGE NOTIFICATION ---------- */
export const createStockChangeNotification = async (productId, oldStock, newStock) => {
  try {
    const product = await Product.findById(productId)
      .populate("vendor", "storeName")
      .populate("name");

    if (!product) return;

    const users = await User.find({
      role: { $in: ["user", "vendor"] },
      _id: { $ne: product.vendor._id }
    }).select("_id");

    const notifications = [];

    for (const user of users) {
      let title = "";
      let message = "";
      let important = false;

      // Stock went from 0 to available (back in stock)
      if (oldStock === 0 && newStock > 0) {
        title = "Back in Stock!";
        message = `${product.name} is now back in stock at ${product.vendor.storeName}`;
        important = true;
      }
      // Stock became 0 (out of stock)
      else if (newStock === 0 && oldStock > 0) {
        title = "Out of Stock";
        message = `${product.name} is now out of stock at ${product.vendor.storeName}`;
        important = true;
      }
      // Stock is low (less than 10)
      else if (newStock > 0 && newStock < 10) {
        title = "Low Stock Alert";
        message = `${product.name} is running low (${newStock} left) at ${product.vendor.storeName}`;
        important = newStock < 5;
      }
      // Significant stock increase
      else if (newStock > oldStock * 2) {
        title = "Stock Updated";
        message = `${product.name} stock increased to ${newStock} at ${product.vendor.storeName}`;
      }

      if (title && message) {
        const notification = await createNotification(user._id, {
          type: "STOCK_CHANGE",
          title,
          message,
          productId: product._id,
          vendorId: product.vendor._id,
          data: {
            oldValue: oldStock,
            newValue: newStock,
            productName: product.name,
            vendorName: product.vendor.storeName,
            stockStatus: newStock === 0 ? "out" : newStock < 10 ? "low" : "available",
          },
          important,
        });

        if (notification) notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating stock change notification:", error);
  }
};

/* ---------- AVAILABILITY CHANGE NOTIFICATION ---------- */
export const createAvailabilityChangeNotification = async (productId, wasAvailable, isNowAvailable) => {
  try {
    const product = await Product.findById(productId)
      .populate("vendor", "storeName")
      .populate("name");

    if (!product) return;

    // Only notify if status changed
    if (wasAvailable !== isNowAvailable) {
      const users = await User.find({
        role: { $in: ["user", "vendor"] },
        _id: { $ne: product.vendor._id }
      }).select("_id");

      const notifications = [];

      for (const user of users) {
        const notification = await createNotification(user._id, {
          type: "AVAILABILITY_CHANGE",
          title: isNowAvailable ? "Product Available" : "Product Unavailable",
          message: `${product.name} is now ${isNowAvailable ? 'available' : 'unavailable'} at ${product.vendor.storeName}`,
          productId: product._id,
          vendorId: product.vendor._id,
          data: {
            oldValue: wasAvailable,
            newValue: isNowAvailable,
            productName: product.name,
            vendorName: product.vendor.storeName,
          },
          important: true,
        });

        if (notification) notifications.push(notification);
      }

      return notifications;
    }
  } catch (error) {
    console.error("Error creating availability change notification:", error);
  }
};

/* ---------- NEW PRODUCT NOTIFICATION ---------- */
export const createNewProductNotification = async (productId) => {
  try {
    const product = await Product.findById(productId)
      .populate("vendor", "storeName location")
      .populate("name category price");

    if (!product) return;

    // Find users and vendors in the same location
    const users = await User.find({
      role: { $in: ["user", "vendor"] },
      _id: { $ne: product.vendor._id },
      $or: [
        { "location.address": new RegExp(product.vendor.location.address, "i") },
        { "location.city": new RegExp(product.vendor.location.address, "i") },
      ]
    }).select("_id");

    const notifications = [];

    for (const user of users) {
      const notification = await createNotification(user._id, {
        type: "NEW_PRODUCT",
        title: "New Product Available",
        message: `New ${product.category.toLowerCase()}: ${product.name} available at ${product.vendor.storeName} for ₹${product.price}`,
        productId: product._id,
        vendorId: product.vendor._id,
        data: {
          productName: product.name,
          vendorName: product.vendor.storeName,
          category: product.category,
          price: product.price,
          location: product.vendor.location.address,
        },
        important: false,
      });

      if (notification) notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating new product notification:", error);
  }
};

/* ---------- GET USER NOTIFICATIONS ---------- */
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const filter = { userId };
    if (unreadOnly === "true") {
      filter.read = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("productId", "name imageUrl")
      .populate("vendorId", "storeName");

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      total,
      unreadCount,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

/* ---------- MARK AS READ ---------- */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
    });
  }
};

/* ---------- MARK ALL AS READ ---------- */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
      error: error.message,
    });
  }
};

/* ---------- DELETE NOTIFICATION ---------- */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

/* ---------- CLEAR ALL NOTIFICATIONS ---------- */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications cleared`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing notifications",
      error: error.message,
    });
  }
};