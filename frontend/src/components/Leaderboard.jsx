import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LeaderBoard = ({
  fetchUrl,
  streamUrl,
  title = "Leaderboard",
  pageSize = 5,
  city = "" // Add city prop
}) => {
  const { token } = useAuth(); // Get token from auth context
  const [products, setProducts] = useState([]);
  const [prevPrices, setPrevPrices] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedId, setLastUpdatedId] = useState(null);

  /* FILTER STATE */
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");
  const [sortByStock, setSortByStock] = useState("");

  const sseRef = useRef(null);

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async (pageNo = 1) => {
    if (!fetchUrl || !token) {
      console.log("Missing fetchUrl or token");
      return;
    }

    try {
      setLoading(true);
      const params = {
        page: pageNo,
        limit: pageSize,
        ...(city && { city }), // Add city parameter
        ...(category && { category }),
        ...(stockStatus && { stockStatus }),
        ...(sortByPrice && { sortByPrice }),
        ...(sortByStock && { sortByStock }),
      };

      console.log("Fetching products with params:", params);

      const res = await axios.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // Add authorization header
        },
        params,
      });

      console.log("Products API response:", res.data);

      if (res.data?.success) {
        const fetched = res.data.data;
        console.log(`Fetched ${fetched.length} products`);

        setPrevPrices((prev) => {
          const map = { ...prev };
          fetched.forEach((p) => {
            map[p._id] = map[p._id] ?? p.price;
          });
          return map;
        });
        setProducts(fetched);
        setPages(res.data.pages || 1);
      } else {
        console.log("API returned non-success:", res.data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed:", err.response || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, category, stockStatus, sortByPrice, sortByStock, fetchUrl, token, city]);

  /* ---------------- SSE UPDATES ---------------- */
  useEffect(() => {
    if (!streamUrl || !token) {
      console.log("Missing streamUrl or token for SSE");
      return;
    }

    // Close previous connection if exists
    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      sseRef.current = new EventSource(streamUrl);

      sseRef.current.onopen = () => {
        console.log("SSE connection established");
      };

      sseRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          console.log("SSE update received:", update);

          if (!update?.product?._id) return;

          setLastUpdatedId(update.product._id);
          setTimeout(() => setLastUpdatedId(null), 2000);

          setProducts((prev) =>
            prev.map((p) => {
              if (p._id !== update.product._id) return p;
              setPrevPrices((prices) => ({
                ...prices,
                [p._id]: p.price,
              }));
              return { ...p, ...update.product };
            })
          );
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      sseRef.current.onerror = (error) => {
        console.error("SSE connection error:", error);
        sseRef.current?.close();
      };

    } catch (error) {
      console.error("Error setting up SSE:", error);
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        console.log("SSE connection closed");
      }
    };
  }, [streamUrl, token]);

  return (
    <div className="p-4 md:p-6 w-full max-h-[calc(100vh-120px)] overflow-y-auto">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {city && (
            <p className="text-sm text-gray-500 mt-1">
              Showing products in <span className="font-medium text-green-600">{city}</span>
            </p>
          )}
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
          </select>

          <select
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="med">Medium Stock</option>
            <option value="high">High Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
            value={sortByPrice}
            onChange={(e) => {
              setSortByStock("");
              setSortByPrice(e.target.value);
            }}
          >
            <option value="">Sort by Price</option>
            <option value="asc">Price ↑</option>
            <option value="desc">Price ↓</option>
          </select>

          <button
            onClick={() => {
              setCategory("");
              setStockStatus("");
              setSortByPrice("");
              setSortByStock("");
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors border border-gray-300"
          >
            Clear
          </button>
        </div>
      </section>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left text-gray-600 font-bold uppercase text-xs tracking-wider">Product</th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">Category</th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">Stock</th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">Unit</th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">Price</th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">Vendor</th>
            </tr>
          </thead>

          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <p className="text-sm text-gray-500">Loading products...</p>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">🥦</div>
                    <p className="text-gray-400">No products found</p>
                    {city && (
                      <p className="text-sm text-gray-500">
                        Try changing filters or check back later
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {products.map((p) => {
                  const stockVal = p.stock?.current ?? p.stock;
                  const prev = prevPrices[p._id];
                  const up = prev !== undefined && p.price > prev;
                  const down = prev !== undefined && p.price < prev;
                  const isHighlighted = lastUpdatedId === p._id;

                  return (
                    <motion.tr
                      key={p._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: isHighlighted ? 1.01 : 1,
                        backgroundColor: isHighlighted ? "rgba(74, 222, 128, 0.2)" : "rgba(255, 255, 255, 0)",
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-gray-50 relative transition-colors hover:bg-gray-50/50"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <motion.img
                          animate={{ scale: isHighlighted ? [1, 1.25, 1] : 1 }}
                          transition={{ duration: 0.4 }}
                          src={p.imageUrl || "https://via.placeholder.com/150?text=Product"}
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-md bg-gray-100 p-1"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Product"; }}
                        />
                        <div>
                          <span className="font-semibold text-gray-800 block">{p.name}</span>
                          {p.vendor?.storeName && (
                            <span className="text-xs text-gray-500">by {p.vendor.storeName}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.category === 'Vegetable' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${stockVal === 0 ? 'bg-red-100 text-red-600' : stockVal < 10 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                          {stockVal}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-500 font-medium">{p.unit}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                          ₹{p.price}
                          <AnimatePresence mode="wait">
                            {up && <motion.div key="up" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -5, opacity: 0 }}><ArrowUp className="w-4 text-red-600" /></motion.div>}
                            {down && <motion.div key="down" initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}><ArrowDown className="w-4 text-green-600" /></motion.div>}
                          </AnimatePresence>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-500">
                        {p.vendor?.storeName || "Unknown"}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {products.length > 0 && pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Prev
          </button>
          <span className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-700">
            {page} / {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* Info message */}
      {products.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Price changes update in real-time. Watch for arrows indicating price movements.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;