import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import authRoutes from "./src/auth/authRoutes.js";
import productRoutes from "./src/products/productRoutes.js";
import basketRoutes from "./src/basket/basketRoutes.js";
import cors from "cors";
import startProductWorker from "./src/queue/productWorker.js";

// Function to log messages
const logRequest = (message) => {
  console.log(`[LOG]: ${message}`);
};

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use((req, res, next) => {
  logRequest(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/basket", basketRoutes);

// Start product worker
startProductWorker();

app.get("/", (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

app.listen(PORT, () => {
  logRequest(`Server is running on port ${PORT}`);
});
