import { getNextJob } from "./productQueue.js";
import { Product } from "../products/productModel.js";
import { Basket } from "../basket/basketModel.js";
import productEvents from "../utils/events.js";

/**
 * Fetch full product object with vendor info
 */
const getFullProduct = async (productId) => {
  return await Product.findById(productId).populate("vendor", "storeName location");
};

/**
 * Process one job safely
 */
const processJob = async (job) => {
  const { type, payload } = job;

  switch (type) {
    /* ---------- PRICE ---------- */
    case "PRICE_UPDATE": {
      const { productId, newPrice } = payload;
      const product = await Product.findById(productId);
      if (!product) return;

      product.price = newPrice;
      await product.save();

      const fullProduct = await getFullProduct(productId);

      productEvents.emit("productUpdate", {
        type: "PRICE_UPDATE",
        product: fullProduct,
      });
      break;
    }

    /* ---------- STOCK ---------- */
    case "STOCK_UPDATE": {
      const { productId, newStock, location } = payload;

      const product = await Product.findById(productId);
      if (!product) return;

      const oldStock = product.stock.current;
      product.stock.before = oldStock;
      product.stock.current = newStock;
      await product.save();

      const stockDelta = newStock - oldStock;

      // Update/Upsert Basket Analytics
      const basket = await Basket.findOneAndUpdate(
        { product: productId, location },
        { $set: { lastStockDelta: stockDelta } },
        { upsert: true, new: true }
      );

      // Recalculate Demand Index
      if (basket && newStock > 0) {
        basket.demandIndex = Math.round((basket.demandCount / newStock) * 100);
        await basket.save();
      }

      const fullProduct = await getFullProduct(productId);

      // 1. Emit full product update
      productEvents.emit("productUpdate", {
        type: "STOCK_UPDATE",
        product: fullProduct,
        demandIndex: basket?.demandIndex || 0,
      });

      // 2. Emit demand analytics separately
      productEvents.emit("demandUpdate", {
        type: "DEMAND_ANALYTICS",
        location,
        productId,
        demandIndex: basket?.demandIndex || 0,
        demandCount: basket?.demandCount || 0,
      });
      break;
    }

    /* ---------- AVAILABILITY ---------- */
    case "AVAILABILITY_UPDATE": {
      const { productId, available } = payload;
      await Product.findByIdAndUpdate(productId, { available });

      const fullProduct = await getFullProduct(productId);

      productEvents.emit("productUpdate", {
        type: "AVAILABILITY_UPDATE",
        product: fullProduct,
      });
      break;
    }

    /* ---------- TITLE ---------- */
    case "TITLE_UPDATE": {
      const { productId, name } = payload;
      await Product.findByIdAndUpdate(productId, { name });

      const fullProduct = await getFullProduct(productId);

      productEvents.emit("productUpdate", {
        type: "TITLE_UPDATE",
        product: fullProduct,
      });
      break;
    }

    default:
      console.warn("Unknown queue job type:", type);
  }
};

/**
 * Start worker loop
 */
const startProductWorker = () => {
  console.log("🟢 Product Queue Worker started");

  setInterval(async () => {
    const job = getNextJob();
    if (!job) return;

    try {
      await processJob(job);
    } catch (err) {
      console.error("❌ Worker error:", err.message);
    }
  }, 100);
};

export default startProductWorker;
