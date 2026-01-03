import { Basket } from "./basketModel.js";
import { Product } from "../products/productModel.js";

const addToBasket = async (req, res) => {
  const { productId } = req.body;

  try {
    // 1. Fetch product to get vendor and location context
    const product = await Product.findById(productId).populate(
      "vendor",
      "location"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Atomic Upsert: Increment demandCount if exists, else create new
    const basketEntry = await Basket.findOneAndUpdate(
      { product: productId, location: product.vendor.location },
      {
        $inc: { demandCount: 1 },
        $setOnInsert: { vendor: product.vendor._id },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Demand registered",
      demandCount: basketEntry.demandCount,
      location: basketEntry.location,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating basket demand", error: error.message });
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
