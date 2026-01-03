import { Product } from "./productModel.js";
import { User } from "../auth/authModel.js";
import { Basket } from "../basket/basketModel.js";
import productEvents from "../utils/events.js";

// GET /location
const getProductsByLocation = async (req, res) => {
  const {
    city,
    category,
    minPrice,
    maxPrice,
    stockStatus,
    sortByPrice,
    sortByStock,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    const vendors = await User.find({
      location: new RegExp(city, "i"),
      role: "vendor",
    }).select("_id");

    const vendorIds = vendors.map((v) => v._id);
    const filter = { vendor: { $in: vendorIds } };

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (stockStatus) {
      // Updated to query nested stock.current field
      if (stockStatus === "low") filter["stock.current"] = { $gt: 0, $lt: 10 };
      else if (stockStatus === "med")
        filter["stock.current"] = { $gte: 10, $lte: 50 };
      else if (stockStatus === "high") filter["stock.current"] = { $gt: 50 };
      else if (stockStatus === "out") filter["stock.current"] = 0;
    }

    let sortOptions = {};
    if (sortByPrice) {
      sortOptions.price = sortByPrice === "asc" ? 1 : -1;
    } else if (sortByStock) {
      sortOptions["stock.current"] = sortByStock === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter)
      .populate("vendor", "storeName location")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// GET /:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "storeName location"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /
const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, stock } = req.body;

    const newProduct = new Product({
      name,
      category,
      price,
      unit,
      stock: {
        current: stock, // Incoming stock value set as current
        before: 0, // Default before is 0 on creation
      },
      vendor: req.user._id,
    });

    await newProduct.save();

    productEvents.emit("productUpdate", {
      type: "NEW_PRODUCT",
      product: newProduct,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: "Creation failed", error: error.message });
  }
};

const verifyOwnershipAndStore = async (productId, userId) => {
  const product = await Product.findById(productId);
  if (!product) return { error: "Product not found", status: 404 };
  if (product.vendor.toString() !== userId.toString()) {
    return { error: "Unauthorized access", status: 403 };
  }
  return { product };
};

// PUT /:id/title
const updateProductTitle = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    check.product.name = req.body.name;
    await check.product.save();
    res.status(200).json(check.product);
  } catch (error) {
    res.status(400).json({ message: "Update failed" });
  }
};

// PATCH /:id/price
const updateProductPrice = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    check.product.price = req.body.price;
    await check.product.save();

    productEvents.emit("productUpdate", {
      type: "PRICE_UPDATE",
      productId: check.product._id,
      newPrice: check.product.price,
    });

    res.status(200).json(check.product);
  } catch (error) {
    res.status(400).json({ message: "Price update failed" });
  }
};

// Inside productController.js -> updateProductStock

const updateProductStock = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    const oldStock = check.product.stock.current;
    const newStockValue = req.body.stock;

    check.product.stock.before = oldStock;
    check.product.stock.current = newStockValue;
    await check.product.save();

    // Calculate Demand Impact
    // If stock decreases (delta is negative), demandIndex should rise
    const stockDelta = newStockValue - oldStock;

    // Update Basket Analytics
    const basket = await Basket.findOneAndUpdate(
      { product: check.product._id, location: req.user.location },
      { $set: { lastStockDelta: stockDelta } },
      { upsert: true, new: true }
    );

    // Dynamic Demand Index Calculation: (DemandCount / CurrentStock) * 100
    // Higher index = High urgency/low supply
    if (basket && newStockValue > 0) {
      basket.demandIndex = Math.round(
        (basket.demandCount / newStockValue) * 100
      );
      await basket.save();
    }

    // Emit SSE with new analytics
    productEvents.emit("productUpdate", {
      type: "STOCK_UPDATE",
      productId: check.product._id,
      newStock: newStockValue,
      demandIndex: basket ? basket.demandIndex : 0,
    });

    res.status(200).json(check.product);
  } catch (error) {
    res.status(400).json({ message: "Stock update failed" });
  }
};

// PATCH /:id/available
const updateProductAvailable = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    check.product.available = req.body.available;
    await check.product.save();
    res.status(200).json(check.product);
  } catch (error) {
    res.status(400).json({ message: "Availability update failed" });
  }
};

// DELETE /:id
const deleteProduct = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export {
  getProductsByLocation,
  getProductById,
  createProduct,
  updateProductTitle,
  updateProductPrice,
  updateProductStock,
  updateProductAvailable,
  deleteProduct,
};
