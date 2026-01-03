import { Product } from "./productModel.js";
import { User } from "../auth/authModel.js";
import productEvents from "../utils/events.js";
import { addToQueue } from "../queue/productQueue.js";

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

/* ---------- GET SINGLE ---------- */
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "vendor",
    "storeName location"
  );
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
};

/* ---------- CREATE ---------- */
const createProduct = async (req, res) => {
  const { name, category, price, unit, stock } = req.body;

  const product = await Product.create({
    name,
    category,
    price,
    unit,
    stock: { current: stock, before: 0 },
    vendor: req.user._id,
  });

  productEvents.emit("productUpdate", {
    type: "NEW_PRODUCT",
    product,
  });

  res.status(201).json(product);
};

/* ---------- OWNERSHIP ---------- */
const verifyOwnershipAndStore = async (productId, userId) => {
  const product = await Product.findById(productId);
  if (!product) return { error: "Product not found", status: 404 };
  if (product.vendor.toString() !== userId.toString())
    return { error: "Unauthorized", status: 403 };
  return { product };
};

const updateProductTitle = async (req, res) => {
  const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
  if (check.error)
    return res.status(check.status).json({ message: check.error });

  const { name } = req.body;

  // Emit immediate SSE
  productEvents.emit("productUpdate", {
    type: "TITLE_UPDATE",
    product: { _id: check.product._id, name },
  });

  // Queue DB write
  await addToQueue("TITLE_UPDATE", {
    productId: check.product._id,
    name,
  });

  res.json({ success: true, message: "Title update queued and frontend notified" });
};


const updateProductPrice = async (req, res) => {
  const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
  if (check.error)
    return res.status(check.status).json({ message: check.error });

  const { price } = req.body;

  // Emit immediate SSE (optimistic update)
  productEvents.emit("productUpdate", {
    type: "PRICE_UPDATE",
    product: { _id: check.product._id, price },
  });

  // Queue DB write
  await addToQueue("PRICE_UPDATE", {
    productId: check.product._id,
    newPrice: price,
  });

  res.json({ success: true, message: "Price update queued and frontend notified" });
};


const updateProductStock = async (req, res) => {
  const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
  if (check.error)
    return res.status(check.status).json({ message: check.error });

  const { stock } = req.body;

  // Emit immediate SSE
  productEvents.emit("productUpdate", {
    type: "STOCK_UPDATE",
    product: { _id: check.product._id, stock: { current: stock } },
  });

  // Queue DB write
  await addToQueue("STOCK_UPDATE", {
    productId: check.product._id,
    newStock: stock,
    location: req.user.location,
  });

  res.json({ success: true, message: "Stock update queued and frontend notified" });
};


const updateProductAvailable = async (req, res) => {
  const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
  if (check.error)
    return res.status(check.status).json({ message: check.error });

  const { available } = req.body;

  // Emit immediate SSE
  productEvents.emit("productUpdate", {
    type: "AVAILABILITY_UPDATE",
    product: { _id: check.product._id, available },
  });

  // Queue DB write
  await addToQueue("AVAILABILITY_UPDATE", {
    productId: check.product._id,
    available,
  });

  res.json({ success: true, message: "Availability update queued and frontend notified" });
};


/* ---------- DELETE ---------- */
const deleteProduct = async (req, res) => {
  try {
    const check = await verifyOwnershipAndStore(req.params.id, req.user._id);
    if (check.error)
      return res.status(check.status).json({ message: check.error });

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch {
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
