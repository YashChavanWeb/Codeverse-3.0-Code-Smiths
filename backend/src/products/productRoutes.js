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
  getProductImageByName,
} from "./productController.js";

const router = express.Router();

// --- Public Routes ---

/**
 * @route   GET /api/v1/products/location
 * @desc    Get products with filters (city, category, price, stockStatus) and pagination
 */
router.get("/location", getProductsByLocation);
router.get("/lookup-image", getProductImageByName);

/**
 * @route   GET /api/v1/products/stream
 * @desc    SSE endpoint for real-time updates (New products, Price/Stock changes)
 */
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  productEvents.on("productUpdate", sendUpdate);

  req.on("close", () => {
    productEvents.off("productUpdate", sendUpdate);
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

export default router;
