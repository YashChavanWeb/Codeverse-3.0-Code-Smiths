import express from "express";
const router = express.Router();

import {
  getProductsByLocation,
  getProductById,
  createProduct,
  updateProductTitle,
  updateProductPrice,
  updateProductStock,
  updateProductAvailable,
  deleteProduct,
} from "./productController.js";
import verifyUser from "../auth/authMiddleware.js";

// pagination
// filters - location/price
// filters - location/category
// filters - location/stock (high, med, low)
router.get("/location", getProductsByLocation);
/*
http://localhost:3000/api/v1/products/location?city=Vasai&category=Vegetable&minPrice=20&maxPrice=80

http://localhost:3000/api/v1/products/location?city=Vasai&sortByPrice=asc

http://localhost:3000/api/v1/products/location?city=Vasai&stockStatus=low

http://localhost:3000/api/v1/products/location?city=Vasai&category=Fruit&sortByStock=desc

http://localhost:3000/api/v1/products/location?city=Vasai&category=Fruit&minPrice=150&limit=5&page=1

*/

router.get("/:id", getProductById);

router.post("/", verifyUser, createProduct);
router.put("/:id/title", verifyUser, updateProductTitle);
router.patch("/:id/price", verifyUser, updateProductPrice);
router.patch("/:id/stock", verifyUser, updateProductStock);
router.patch("/:id/available", verifyUser, updateProductAvailable);

router.delete("/:id", verifyUser, deleteProduct);

export default router;
