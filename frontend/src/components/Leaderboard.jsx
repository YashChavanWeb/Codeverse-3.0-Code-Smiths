import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Plus, Check } from "lucide-react";
import axios from "axios";
import { useBasket } from "../context/BasketContext";

const LeaderBoard = ({
  fetchUrl,
  streamUrl,
  title = "Leaderboard",
  pageSize = 5,
}) => {
  const [products, setProducts] = useState([]);
  const [prevPrices, setPrevPrices] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedId, setLastUpdatedId] = useState(null);

  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");

  const [addedMap, setAddedMap] = useState({});

  const sseRef = useRef(null);

  const { basket, addToBasket } = useBasket();

  /* ---------------- BASKET HELPERS ---------------- */

  const getQtyInBasket = (productId) => {
    const item = basket.find((b) => b.product?._id === productId);
    return item ? item.qty : 0;
  };

  const handleAddToBasket = (p) => {
    addToBasket(
      {
        _id: p._id,
        name: p.name,
        price: p.price,
      },
      {
        _id: p.vendorId || "leaderboard",
        name: "Leaderboard Vendor",
      }
    );

    setAddedMap((prev) => ({
      ...prev,
      [p._id]: true,
    }));
  };

  /* ---------------- FETCH DATA ---------------- */

  const fetchData = async (pageNo = 1) => {
    if (!fetchUrl) return;
    try {
      setLoading(true);
      const res = await axios.get(fetchUrl, {
        params: {
          page: pageNo,
          limit: pageSize,
          category: category || undefined,
          stockStatus: stockStatus || undefined,
          sortByPrice: sortByPrice || undefined,
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

  useEffect(() => {
    fetchData(page);
  }, [page, category, stockStatus, sortByPrice, fetchUrl]);

  /* ---------------- SSE ---------------- */

  useEffect(() => {
    if (!streamUrl) return;
    sseRef.current = new EventSource(streamUrl);

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
  }, [streamUrl]);

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-6 w-full">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-50 border-b">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-center">Category</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Unit</th>
              <th className="p-4 text-center">Price</th>
              <th className="p-4 text-center">Basket</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const stockVal = p.stock?.current ?? p.stock;
              const prev = prevPrices[p._id];
              const up = prev !== undefined && p.price > prev;
              const down = prev !== undefined && p.price < prev;
              const qty = getQtyInBasket(p._id);
              const isAdded = qty > 0 || addedMap[p._id];

              return (
                <motion.tr
                  key={p._id}
                  layout
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 flex items-center gap-2">
                    <img
                      src={p.imageUrl}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=Product")
                      }
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="font-semibold">{p.name}</span>
                  </td>

                  <td className="p-4 text-center">{p.category}</td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold ${
                        stockVal < 40
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {stockVal}
                    </span>
                  </td>

                  <td className="p-4 text-center">{p.unit}</td>

                  <td className="p-4 text-center font-bold">
                    ₹{p.price}
                    {up && <ArrowUp className="inline w-4 text-red-600 ml-1" />}
                    {down && (
                      <ArrowDown className="inline w-4 text-green-600 ml-1" />
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      disabled={stockVal === 0}
                      onClick={() => handleAddToBasket(p)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
                        transition-all active:scale-95
                        ${
                          isAdded
                            ? "bg-green-100 text-green-700 border border-green-400"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }
                        disabled:opacity-40`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          Added
                          {qty > 0 && (
                            <span className="ml-1 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
                              {qty}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Add
                        </>
                      )}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;
