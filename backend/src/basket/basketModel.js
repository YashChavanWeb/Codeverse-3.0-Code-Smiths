import mongoose from "mongoose";

const basketSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    demandCount: {
      type: Number,
      default: 0,
    },
    // Percentage indicating demand pressure (Demand vs Supply)
    demandIndex: {
      type: Number,
      default: 0,
    },
    lastStockDelta: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

basketSchema.index({ product: 1, location: 1 }, { unique: true });

export const Basket = mongoose.model("Basket", basketSchema);
