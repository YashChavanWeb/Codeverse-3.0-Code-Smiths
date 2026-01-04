import { Basket } from "../basket/basketModel.js";
import { Product } from "../products/productModel.js";
import { User } from "../auth/authModel.js";

const getVendorLeaderboard = async (req, res) => {
  const { city } = req.query;

  try {
    // 1. Aggregate demand per vendor
    const demandAgg = await Basket.aggregate([
      city
        ? { $match: { location: new RegExp(city, "i") } }
        : { $match: {} },

      {
        $group: {
          _id: "$vendor",
          totalDemand: { $sum: "$demandCount" },
          avgDemandIndex: { $avg: "$demandIndex" },
        },
      },
    ]);

    // 2. Aggregate product + stock data per vendor
    const productAgg = await Product.aggregate([
      {
        $group: {
          _id: "$vendor",
          totalProducts: { $sum: 1 },
          availableProducts: {
            $sum: {
              $cond: [{ $eq: ["$available", true] }, 1, 0],
            },
          },
          lastUpdated: { $max: "$updatedAt" },
        },
      },
    ]);

    // 3. Fetch vendor details
    const vendors = await User.find({ role: "vendor" }).select(
      "storeName location"
    );

    // 4. Merge everything
    const leaderboard = vendors.map((vendor) => {
      const demand = demandAgg.find(
        (d) => d._id?.toString() === vendor._id.toString()
      );

      const product = productAgg.find(
        (p) => p._id?.toString() === vendor._id.toString()
      );

      const totalProducts = product?.totalProducts || 0;
      const availableProducts = product?.availableProducts || 0;

      const stockScore =
        totalProducts > 0
          ? Math.round((availableProducts / totalProducts) * 100)
          : 0;

      return {
        vendorId: vendor._id,
        storeName: vendor.storeName,
        location: vendor.location?.address || "",
        scores: {
          totalDemand: demand?.totalDemand || 0,
          avgDemandIndex: Math.round(demand?.avgDemandIndex || 0),
          stockScore,
        },
        stats: {
          totalProducts,
          availableProducts,
        },
        lastUpdated: product?.lastUpdated || null,
        badges: [
          demand?.avgDemandIndex > 70 ? "High Demand" : null,
          stockScore > 80 ? "Reliable Stock" : null,
        ].filter(Boolean),
      };
    });

    // 5. Sort leaderboard
    leaderboard.sort(
      (a, b) => b.scores.totalDemand - a.scores.totalDemand
    );

    res.status(200).json({
      success: true,
      city,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to build vendor leaderboard",
      error: error.message,
    });
  }
};

export { getVendorLeaderboard };
