import express from "express";
const router = express.Router();
import { addToBasket, getRegionalDemand } from "./basketController.js";
import verifyUser from "../auth/authMiddleware.js";

// Publicly visible regional demand
router.get("/demand", getRegionalDemand);

// Registered users can trigger a demand signal
router.post("/add", verifyUser, addToBasket);

export default router;
