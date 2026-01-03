import express from "express";
import { signin, signup, getVendorsByLocation } from "./authController.js";
import verifyUser from "./authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", verifyUser, (req, res) => {
  res.json({ user: req.user });
});

router.get("/vendors", getVendorsByLocation);

export default router;
