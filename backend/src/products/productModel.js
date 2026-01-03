import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Vegetable", "Fruit"], // Based on your dataset
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "bunch", "piece", "box", "dozen"], // Matches your data units
    },
    stock: {
      current: {
        type: Number,
        min: 0,
        default: 0,
      },
      before: {
        type: Number,
        default: 0,
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexing for faster searches by category or name
productSchema.index({ name: "text", category: 1 });
const Product = mongoose.model("Product", productSchema);

export { Product };
