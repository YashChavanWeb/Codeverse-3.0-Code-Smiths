import { Basket } from "./basketModel.js";
import { Product } from "../products/productModel.js";
import productEvents from "../utils/events.js";

const addToBasket = async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId).populate(
      "vendor",
      "location"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    const basketEntry = await Basket.findOneAndUpdate(
      { product: productId, location: product.vendor.location },
      {
        $inc: { demandCount: 1 },
        $setOnInsert: { vendor: product.vendor._id },
      },
      { upsert: true, new: true }
    );

    // Recalculate index if stock exists
    if (product.stock.current > 0) {
      basketEntry.demandIndex = Math.round(
        (basketEntry.demandCount / product.stock.current) * 100
      );
      await basketEntry.save();
    }

    // BROADCAST DEMAND CHANGE
    productEvents.emit("demandUpdate", {
      type: "DEMAND_ANALYTICS",
      location: basketEntry.location,
      productId: productId,
      demandIndex: basketEntry.demandIndex,
      demandCount: basketEntry.demandCount,
    });

    res.status(200).json({ success: true, data: basketEntry });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// GET /api/v1/basket/demand?city=Vasai
const getRegionalDemand = async (req, res) => {
  const { city } = req.query;
  try {
    const demandData = await Basket.find({ location: new RegExp(city, "i") })
      .populate("product", "name price stock")
      .sort({ demandIndex: -1 }); // Sort by most urgent demand

    res.status(200).json({
      success: true,
      city,
      data: demandData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching regional analytics" });
  }
};

export { addToBasket, getRegionalDemand };
