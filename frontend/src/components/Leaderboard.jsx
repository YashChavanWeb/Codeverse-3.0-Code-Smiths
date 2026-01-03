import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";

/* Images */
import apple from "../assets/Images/apple.png";
import tomato from "../assets/Images/tomato.png";
import cabbage from "../assets/Images/cabbage.png";
import banana from "../assets/Images/banana.png";
import potato from "../assets/Images/potato.png";
import carrot from "../assets/Images/carrot.png";
import orange from "../assets/Images/orange.png";
import mango from "../assets/Images/mango.png";

const imageMap = {
  Tomato: tomato,
  Potato: potato,
  Apple: apple,
  Carrot: carrot,
  Banana: banana,
  Cabbage: cabbage,
  Orange: orange,
  Mango: mango,
};

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;
const PAGE_SIZE = 5;

const LeaderBoard = () => {
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

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/location`, {
        params: {
          page: pageNo,
          limit: PAGE_SIZE,
          category: category || undefined,
          stockStatus: stockStatus || undefined,
          sortByPrice: sortByPrice || undefined,
          sortByStock: sortByStock || undefined,
        },
      });

      if (res.data?.success) {
        const fetched = res.data.data;

        setPrevPrices((prev) => {
          const map = { ...prev };
          fetched.forEach((p) => {
            map[p._id] = map[p._id] ?? p.price;
          });
          return map;
        });

        setProducts(fetched);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* Refetch whenever filters or page change */
  useEffect(() => {
    fetchProducts(page);
  }, [page, category, stockStatus, sortByPrice, sortByStock]);

  /* ---------------- SSE UPDATES ---------------- */
  useEffect(() => {
    sseRef.current = new EventSource(`${BASE_URL}/stream`);

    sseRef.current.onmessage = (event) => {
      const update = JSON.parse(event.data);
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
    };

    return () => sseRef.current?.close();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 md:p-6 w-full max-h-[calc(100vh-120px)] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="px-3 py-2 rounded-md bg-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Vegetable">Vegetable</option>
          <option value="Fruit">Fruit</option>
        </select>

        <select
          className="px-3 py-2 rounded-md bg-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
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
          className="px-3 py-2 rounded-md bg-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
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
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm transition-colors"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left text-gray-600 font-bold uppercase text-xs tracking-wider">
                Product
              </th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">
                Category
              </th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">
                Stock
              </th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">
                Unit
              </th>
              <th className="p-4 text-center text-gray-600 font-bold uppercase text-xs tracking-wider">
                Price
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  No products found
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
                        backgroundColor: isHighlighted
                          ? "rgba(74, 222, 128, 0.2)"
                          : "rgba(255, 255, 255, 0)",
                        backdropFilter: isHighlighted ? "blur(8px)" : "blur(0px)",
                        boxShadow: isHighlighted
                          ? "inset 0 0 10px rgba(34, 197, 94, 0.1)"
                          : "none",
                        zIndex: isHighlighted ? 10 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        layout: { duration: 0.4 },
                      }}
                      className={`border-b border-gray-50 relative transition-colors hover:bg-gray-50/50`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <motion.img
                          animate={{
                            scale: isHighlighted ? 1.2 : 1,
                            rotate: isHighlighted ? [0, -10, 10, 0] : 0,
                          }}
                          src={imageMap[p.name] || apple}
                          className="w-12 h-12 object-contain"
                        />
                        <span className="font-semibold text-gray-800">{p.name}</span>
                      </td>

                      <td className="p-4 text-center text-gray-500">{p.category}</td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            stockVal < 40
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {stockVal}
                        </span>
                      </td>

                      <td className="p-4 text-center text-gray-500">{p.unit}</td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                          ₹{p.price}
                          <AnimatePresence mode="wait">
                            {up && (
                              <motion.div
                                key="up"
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -5, opacity: 0 }}
                              >
                                <ArrowUp className="w-4 text-red-600" />
                              </motion.div>
                            )}
                            {down && (
                              <motion.div
                                key="down"
                                initial={{ y: -5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 5, opacity: 0 }}
                              >
                                <ArrowDown className="w-4 text-green-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
        >
          Prev
        </button>

        <span className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-700">
          {page} / {pages}
        </span>

        <button
          disabled={page === pages}
          onClick={() => setPage((p) => p + 1)}
          className="px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaderBoard;
