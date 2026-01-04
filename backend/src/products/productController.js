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
    /* 
    const vendors = await User.find({
      location: new RegExp(city, "i"),
      role: "vendor",
    }).select("_id");

    const vendorIds = vendors.map((v) => v._id);
    const filter = { vendor: { $in: vendorIds } };
    */
    const filter = {}; // Fetch all products irrespective of location for now

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
  const { name, category, price, unit, stock, imageUrl } = req.body;
  const finalImageUrl =
    imageUrl || "https://via.placeholder.com/150?text=No+Image";

  const product = await Product.create({
    name,
    category,
    price,
    unit,
    imageUrl: finalImageUrl,
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

  res.json({
    success: true,
    message: "Title update queued and frontend notified",
  });
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

  res.json({
    success: true,
    message: "Price update queued and frontend notified",
  });
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

  res.json({
    success: true,
    message: "Stock update queued and frontend notified",
  });
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

  res.json({
    success: true,
    message: "Availability update queued and frontend notified",
  });
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

const getVendorsWithProducts = async (req, res) => {
  const { search } = req.query;

  try {
    let productMatch = {};
    if (search) {
      productMatch.name = new RegExp(search, "i");
    }

    // Use aggregation to group products by vendor
    const vendorsWithProducts = await Product.aggregate([
      { $match: productMatch },
      {
        $lookup: {
          from: "users",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: "$vendorDetails" },
      {
        $group: {
          _id: "$vendorDetails._id",
          name: { $first: "$vendorDetails.storeName" },
          address: { $first: "$vendorDetails.location.address" },
          coordinates: { $first: "$vendorDetails.location.coordinates" },
          items: {
            $push: {
              _id: "$_id",
              name: "$name",
              category: "$category",
              price: "$price",
              unit: "$unit",
              imageUrl: "$imageUrl",
              stock: "$stock",
              available: "$available",
            },
          },
        },
      },
    ]);

    // Format coordinates for frontend (split string into [lat, lng])
    const formattedData = vendorsWithProducts.map((v) => {
      let lat = 0,
        lng = 0;
      if (v.coordinates && v.coordinates !== "manual_entry") {
        const parts = v.coordinates.split(",");
        lat = parseFloat(parts[0]?.trim());
        lng = parseFloat(parts[1]?.trim());
      }
      return {
        ...v,
        lat,
        lng,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendors with products",
      error: error.message,
    });
  }
};

const getProductImageByName = async (req, res) => {
  const { name } = req.query;

  try {
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Find one product with this name that HAS an imageUrl
    const product = await Product.findOne({
      name: new RegExp(`^${name}$`, "i"), // Exact match, case-insensitive
      imageUrl: { $exists: true, $ne: "" },
    }).select("imageUrl");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No image found" });
    }

    res.status(200).json({
      success: true,
      imageUrl: product.imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// productController.js - Add this new function

// productController.js - Update the getVendorLeaderboard function
/// Update the getVendorLeaderboard function in productController.js
/* ---------- VENDOR LEADERBOARD WITH DEMAND ANALYTICS ---------- */
const getVendorLeaderboard = async (req, res) => {
  const { city, sortBy = "productCount", page = 1, limit = 10 } = req.query;

  try {
    // Match products by city if provided
    let productMatch = {};
    let vendorIds = [];
    
    if (city) {
      // Extract just the main city name from location (e.g., "Vasai" from "Vasai West, Mumbai")
      const vendorsInCity = await User.find({
        $or: [
          { "location.address": new RegExp(city, "i") },
          { "location.city": new RegExp(city, "i") },
          { location: new RegExp(city, "i") }
        ],
        role: "vendor",
      }).select("_id location");
      
      vendorIds = vendorsInCity.map((v) => v._id);
      if (vendorIds.length > 0) {
        productMatch.vendor = { $in: vendorIds };
      }
    }

    // Aggregate vendor statistics with demand data
    const vendorStats = await Product.aggregate([
      { $match: productMatch },
      {
        $lookup: {
          from: "users",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: "$vendorDetails" },
      {
        $lookup: {
          from: "baskets",
          localField: "_id",
          foreignField: "product",
          as: "demandData",
        },
      },
      {
        $group: {
          _id: "$vendor",
          storeName: { $first: "$vendorDetails.storeName" },
          // Extract main location only (first part before comma)
          location: {
            $first: {
              $arrayElemAt: [
                {
                  $split: [
                    { 
                      $ifNull: [
                        "$vendorDetails.location.address",
                        "$vendorDetails.location", 
                        "Unknown"
                      ] 
                    },
                    ","
                  ]
                },
                0
              ]
            }
          },
          productCount: { $sum: 1 },
          totalStock: { $sum: "$stock.current" },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ["$stock.current", 0] }, 1, 0] },
          },
          lowStockItems: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$stock.current", 0] },
                    { $lt: ["$stock.current", 10] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // Demand Analytics
          totalDemand: {
            $sum: {
              $reduce: {
                input: "$demandData",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.demandCount"] }
              }
            }
          },
          avgDemandIndex: {
            $avg: {
              $map: {
                input: "$demandData",
                as: "demand",
                in: "$$demand.demandIndex"
              }
            }
          },
          highDemandProducts: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$demandData.demandIndex", 0] },
                        0
                      ]
                    },
                    50
                  ]
                },
                1,
                0
              ]
            }
          },
          avgPrice: { $avg: "$price" },
          availableProducts: {
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          storeName: 1,
          location: { $trim: { input: "$location" } }, // Clean up whitespace
          productCount: 1,
          totalStock: 1,
          outOfStockItems: 1,
          lowStockItems: 1,
          // Demand Metrics
          totalDemand: { $ifNull: ["$totalDemand", 0] },
          avgDemandIndex: { $round: [{ $ifNull: ["$avgDemandIndex", 0] }, 1] },
          highDemandProducts: 1,
          demandPressure: {
            $cond: [
              { $eq: ["$totalStock", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$totalDemand", "$totalStock"] },
                      100
                    ]
                  },
                  1
                ]
              }
            ]
          },
          // Stock Health
          stockHealth: {
            $cond: [
              { $eq: ["$productCount", 0] },
              0,
              {
                $round: [
                  {
                    $subtract: [
                      100,
                      {
                        $multiply: [
                          {
                            $divide: [
                              { $add: ["$outOfStockItems", "$lowStockItems"] },
                              "$productCount",
                            ],
                          },
                          100,
                        ],
                      },
                    ],
                  },
                  1
                ]
              },
            ],
          },
          avgPrice: { $round: ["$avgPrice", 2] },
          availableProducts: 1,
          availabilityRate: {
            $cond: [
              { $eq: ["$productCount", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$availableProducts", "$productCount"] },
                      100,
                    ],
                  },
                  1
                ]
              },
            ],
          },
        },
      },
    ]);

    // Default sorting options
    let sortField = "productCount";
    let sortOrder = -1;

    if (sortBy === "stockHealth") sortField = "stockHealth";
    else if (sortBy === "availabilityRate") sortField = "availabilityRate";
    else if (sortBy === "totalStock") sortField = "totalStock";
    else if (sortBy === "avgPrice") {
      sortField = "avgPrice";
      sortOrder = 1;
    } else if (sortBy === "demandPressure") {
      sortField = "demandPressure";
      sortOrder = -1;
    } else if (sortBy === "totalDemand") {
      sortField = "totalDemand";
      sortOrder = -1;
    }

    // Sort the results
    vendorStats.sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      if (aValue < bValue) return sortOrder;
      if (aValue > bValue) return -sortOrder;
      return 0;
    });

    // Pagination
    const total = vendorStats.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedData = vendorStats.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      sortBy,
      data: paginatedData,
    });
  } catch (error) {
    console.error("Error in getVendorLeaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendor leaderboard",
      error: error.message,
    });
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
  getVendorsWithProducts,
  getProductImageByName,
  getVendorLeaderboard,
};
