import express from "express";
const router = express.Router();
import {
  addToBasket,
  getRegionalDemand,
  getEstimatorProducts,
  estimateBasket,
} from "./basketController.js";
import verifyUser from "../auth/authMiddleware.js";
import productEvents from "../utils/events.js";

// Publicly visible regional demand
// GET /api/v1/basket/stream/demand?city=Vasai
router.get("/demand", getRegionalDemand);
router.get("/estimator-products", getEstimatorProducts);
router.post("/estimate", estimateBasket);

router.get("/demand/stream", (req, res) => {
  const { city } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendDemandUpdate = (data) => {
    // Optimization: Only push data relevant to the user's city
    if (!city || data.location.toLowerCase() === city.toLowerCase()) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  productEvents.on("demandUpdate", sendDemandUpdate);

  req.on("close", () => {
    productEvents.off("demandUpdate", sendDemandUpdate);
    res.end();
  });
});

// Registered users can trigger a demand signal
router.post("/add", verifyUser, addToBasket);

export default router;
