import express from "express";
import { getVendorLeaderboard } from "./vendorLeaderboardController.js";

const router = express.Router();

// GET /api/v1/vendors/leaderboard?city=Vasai
router.get("/leaderboard", getVendorLeaderboard);

export default router;
