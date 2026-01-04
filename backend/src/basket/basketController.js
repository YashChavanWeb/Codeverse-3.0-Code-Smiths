import { Basket } from "./basketModel.js";
import { Product } from "../products/productModel.js";
import productEvents from "../utils/events.js";

const addToBasket = async (req, res) => {
  const { productId, productName, location } = req.body;
  try {
    let product;
    if (productId) {
      product = await Product.findById(productId).populate(
        "vendor",
        "location"
      );
    } else if (productName) {
      // Find any product with this name to get a reference vendor/location
      // Ideally we want to track demand in the user's city
      const city = location || "Vasai"; // Default or from user profile
      product = await Product.findOne({
        name: new RegExp(`^${productName}$`, "i"),
      }).populate("vendor", "location");
    }

    if (!product) return res.status(404).json({ message: "Product not found" });

    const basketEntry = await Basket.findOneAndUpdate(
      { product: product._id, location: product.vendor.location },
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

// GET /api/v1/basket/estimator-products
const getEstimatorProducts = async (req, res) => {
  try {
    // Get unique product names and their average prices across all vendors
    const products = await Product.aggregate([
      {
        $group: {
          _id: "$name",
          name: { $first: "$name" },
          avgPrice: { $avg: "$price" },
          category: { $first: "$category" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching estimator products" });
  }
};

// POST /api/v1/basket/estimate
const estimateBasket = async (req, res) => {
  const { items } = req.body; // Array of { name, qty }
  try {
    const itemNames = items.map((i) => i.name);

    // Find all products that match these names
    const products = await Product.find({ name: { $in: itemNames } }).populate(
      "vendor",
      "storeName location"
    );

    // Group items by vendor
    const vendorGroups = {};
    products.forEach((p) => {
      const vendorId = p.vendor._id.toString();
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          id: vendorId,
          name: p.vendor.storeName,
          location: p.vendor.location,
          totalPrice: 0,
          matchCount: 0,
          items: [],
        };
      }

      const basketItem = items.find((i) => i.name === p.name);
      if (basketItem) {
        vendorGroups[vendorId].totalPrice += p.price * basketItem.qty;
        vendorGroups[vendorId].matchCount += 1;
        vendorGroups[vendorId].items.push({
          name: p.name,
          price: p.price,
          qty: basketItem.qty,
        });
      }
    });

    // Only include vendors that have ALL requested items (or handle partial matches)
    const results = Object.values(vendorGroups).filter(
      (v) => v.matchCount === items.length
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating estimate", error: error.message });
  }
};

export { addToBasket, getRegionalDemand, getEstimatorProducts, estimateBasket };
