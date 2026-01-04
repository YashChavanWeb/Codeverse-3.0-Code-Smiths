import express from "express";
import productEvents from "../utils/events.js";
import verifyUser from "../auth/authMiddleware.js";
import {
  getProductsByLocation,
  getProductById,
  createProduct,
  updateProductTitle,
  updateProductPrice,
  updateProductStock,
  updateProductAvailable,
  deleteProduct,
  getVendorsWithProducts,
  getProductImageByName,
  getVendorLeaderboard,
  getVendorProducts,
} from "./productController.js";

const router = express.Router();

// --- Public Routes ---

// IMPORTANT: Static routes must come before parameterized routes
router.get("/location", getProductsByLocation);
router.get("/leaderboard", getProductsByLocation); // Alias for user dashboard
router.get("/vendors-with-products", getVendorsWithProducts);
router.get("/lookup-image", getProductImageByName);
router.get("/vendor-leaderboard", getVendorLeaderboard);

/**
 * @route   GET /api/v1/products/stream
 * @desc    SSE endpoint for real-time updates (New products, Price/Stock changes, Demand updates)
 */
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");

  // Flush headers immediately
  res.flushHeaders();

  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for product updates
  productEvents.on("productUpdate", sendUpdate);

  // Listen for demand updates
  productEvents.on("demandUpdate", sendUpdate);

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({
      type: "CONNECTED",
      message: "SSE Connection Established",
    })}\n\n`
  );

  // Keep-alive ping
  const keepAliveInterval = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 30000);

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(keepAliveInterval);
    productEvents.off("productUpdate", sendUpdate);
    productEvents.off("demandUpdate", sendUpdate);
    console.log("Client disconnected from product stream");
    res.end();
  });

  // Handle errors
  req.on("error", (err) => {
    clearInterval(keepAliveInterval);
    console.error("SSE connection error:", err);
    productEvents.off("productUpdate", sendUpdate);
    productEvents.off("demandUpdate", sendUpdate);
    res.end();
  });
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product details
 */
router.get("/:id", getProductById);

// --- Protected Routes (Vendor Only) ---

router.post("/", verifyUser, createProduct);
router.put("/:id/title", verifyUser, updateProductTitle);
router.patch("/:id/price", verifyUser, updateProductPrice);
router.patch("/:id/stock", verifyUser, updateProductStock);
router.patch("/:id/available", verifyUser, updateProductAvailable);
router.delete("/:id", verifyUser, deleteProduct);
router.get("/vendor/my-products", verifyUser, getVendorProducts);

export default router;
