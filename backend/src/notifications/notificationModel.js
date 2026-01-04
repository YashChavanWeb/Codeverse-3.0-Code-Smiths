import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    type: {
      type: String,
      required: true,
      enum: ["PRICE_CHANGE", "STOCK_CHANGE", "AVAILABILITY_CHANGE", "NEW_PRODUCT", "DEMAND_ALERT"],
    },
    
    title: {
      type: String,
      required: true,
    },
    
    message: {
      type: String,
      required: true,
    },
    
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    data: {
      // Store additional data like old price, new price, etc.
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      productName: String,
      vendorName: String,
      location: String,
    },
    
    read: {
      type: Boolean,
      default: false,
    },
    
    important: {
      type: Boolean,
      default: false,
    },
    
    expiresAt: {
      type: Date,
      // Notifications expire after 7 days
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);