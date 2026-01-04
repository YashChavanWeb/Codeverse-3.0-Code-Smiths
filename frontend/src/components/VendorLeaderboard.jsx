import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const VendorLeaderboard = ({
  title = "Top Vendors in Your Area",
  fetchUrl,
  streamUrl = null,
  pageSize = 10,
  showCityFilter = true,
}) => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState("demandPressure"); // Default to demand pressure
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        ...(city && { city }),
      };

      const response = await axios.get(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setData(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      console.error("Error fetching vendor leaderboard:", err);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [token, city, sortBy, currentPage, fetchUrl, pageSize]);

  // Real-time updates for demand and product changes
  useEffect(() => {
    if (!streamUrl || !token) return;

    const eventSource = new EventSource(
      `${streamUrl}${city ? `?city=${city}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        // Refresh on any relevant updates
        if (
          update.type === "PRODUCT_UPDATE" ||
          update.type === "DEMAND_UPDATE" ||
          update.type === "DEMAND_ANALYTICS" ||
          update.type === "STOCK_UPDATE"
        ) {
          fetchLeaderboard();
        }
      } catch (err) {
        console.error("Error parsing SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [streamUrl, token, city]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 border-yellow-300";
    if (rank === 2) return "bg-gray-100 border-gray-300";
    if (rank === 3) return "bg-orange-50 border-orange-200";
    return "bg-white";
  };

  const getDemandColor = (demandPressure) => {
    if (demandPressure > 70) return "text-red-600 bg-red-50";
    if (demandPressure > 40) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">
            Showing {data.length} vendors • Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {showCityFilter && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by city..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-48"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">📍</span>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="demandPressure">Demand Pressure</option>
            <option value="totalDemand">Total Demand</option>
            <option value="stockHealth">Stock Health</option>
            <option value="productCount">Most Products</option>
            <option value="availabilityRate">Availability</option>
            <option value="totalStock">Total Stock</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demand Pressure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Health
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Demand
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((vendor, index) => {
              const rank = (currentPage - 1) * pageSize + index + 1;
              return (
                <tr
                  key={vendor._id}
                  className={`hover:bg-gray-50 transition-colors ${getRankColor(
                    rank
                  )}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          rank <= 3
                            ? "bg-green-100 text-green-800 font-bold"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rank}
                      </span>
                      {rank <= 3 && (
                        <span className="ml-2 text-xl">
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.storeName || "Unnamed Store"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vendor.productCount} products
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.location ? vendor.location.address : "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {vendor.productCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-red-500">
                        {vendor.outOfStockItems} out
                      </span>
                      {" • "}
                      <span className="text-yellow-500">
                        {vendor.lowStockItems} low
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              vendor.demandPressure > 70
                                ? "bg-red-500"
                                : vendor.demandPressure > 40
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(vendor.demandPressure || 0, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded-full ${getDemandColor(
                            vendor.demandPressure || 0
                          )}`}
                        >
                          {vendor.demandPressure || 0}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {vendor.highDemandProducts || 0} high-demand items
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            vendor.stockHealth > 70
                              ? "bg-green-500"
                              : vendor.stockHealth > 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(vendor.stockHealth || 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {vendor.stockHealth || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {vendor.totalDemand || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {vendor.avgDemandIndex || 0} index
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === pageNum
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* No Data Message */}
      {data.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No vendor data available.</p>
          {city && (
            <p className="text-sm mt-1">
              Try a different city or check back later.
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Metrics Explained:</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-medium">Demand Pressure:</span>
            <div className="text-gray-600 mt-1">
              Ratio of total demand to total stock. Higher = more demand than supply.
            </div>
          </div>
          <div>
            <span className="font-medium">Stock Health:</span>
            <div className="text-gray-600 mt-1">
              Percentage of items with healthy stock levels (not low or out of stock).
            </div>
          </div>
          <div>
            <span className="font-medium">Total Demand:</span>
            <div className="text-gray-600 mt-1">
              Total number of items added to baskets across all products.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLeaderboard;
