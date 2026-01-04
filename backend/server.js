import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/db.js";
import authRoutes from "./src/auth/authRoutes.js";
import productRoutes from "./src/products/productRoutes.js";
import basketRoutes from "./src/basket/basketRoutes.js";
import cors from "cors";
import startProductWorker from "./src/queue/productWorker.js";

import verifyUser from "./src/auth/authMiddleware.js";
import { parseVoiceInput } from "./src/utils/voice.controller.js";
import vendorLeaderboardRoutes from "./src/vendor/vendorLeaderboardRoutes.js" ; 
import notificationRoutes from "./src/notifications/notificationRoutes.js";


const logRequest = (message) => {
  console.log(`[LOG]: ${message}`);
};

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use((req, res, next) => {
  logRequest(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// DB connection
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/basket", basketRoutes);


// Add this route (after other routes)
app.use("/api/v1/notifications", notificationRoutes);


app.use("/api/v1/vendors", vendorLeaderboardRoutes);

/* ================================
   🔊 VOICE → GEMINI → ENGLISH
   ================================ */
app.post(
  "/api/v1/voice/parse",
  verifyUser, // ✅ FIXED HERE
  parseVoiceInput
);

// Start product worker
startProductWorker();

// Health check
app.get("/", (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

// Server start
app.listen(PORT, () => {
  logRequest(`Server is running on port ${PORT}`);
});
