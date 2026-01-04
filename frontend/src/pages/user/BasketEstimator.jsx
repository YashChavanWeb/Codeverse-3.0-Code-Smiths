import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBasket, Plus, Check, Loader2, X } from "lucide-react";
import axios from "axios";
import { useBasket } from "../../context/BasketContext";
import { useAuth } from "../../context/AuthContext";

const RATE_PER_KM = 5;

const BasketEstimator = () => {
  const { basket, addToBasket, removeFromBasket, basketTotal } = useBasket();
  const { token } = useAuth();
  const [showVendors, setShowVendors] = useState(false);
  const [estimatorProducts, setEstimatorProducts] = useState([]);
  const [estimatedVendors, setEstimatedVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEstimatorProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/basket/estimator-products`);
        if (res.data.success) {
          setEstimatorProducts(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching estimator products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstimatorProducts();
  }, [BASE_URL]);

  const handleProductAdd = async (product) => {
    setShowVendors(false);

    // 1. User-wise Addition (Local Context)
    // We use a dummy vendor initially for estimation
    addToBasket(
      { _id: `temp-${product.name}`, name: product.name, price: product.avgPrice },
      { _id: "dummy", name: "General" }
    );

    // 2. Demand-wise Addition (Backend Signal)
    if (token) {
      try {
        await axios.post(
          `${BASE_URL}/basket/add`,
          { productName: product.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error signaling demand:", error);
      }
    }
  };

  const calculateBestVendor = async () => {
    if (basket.length === 0) return;
    try {
      setIsCalculating(true);
      const items = basket.map((item) => ({
        name: item.name,
        qty: item.qty,
      }));

      const res = await axios.post(`${BASE_URL}/basket/estimate`, { items });
      if (res.data.success) {
        // Map backend results to include a mock distance for now 
        // (In real app, calculate distance between user and vendor location)
        const enrichedVendors = res.data.data.map((v, idx) => ({
          ...v,
          distance: (idx + 1) * 1.2, // Mock distance
        }));
        setEstimatedVendors(enrichedVendors);
        setShowVendors(true);
      }
    } catch (error) {
      console.error("Error calculating best vendor:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const vendorTotal = (v) => v.totalPrice + v.distance * RATE_PER_KM;

  const cheapest =
    estimatedVendors.length > 0
      ? estimatedVendors.reduce((a, b) =>
        vendorTotal(a) < vendorTotal(b) ? a : b
      )
      : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Basket Estimator
            </h1>
            <p className="text-gray-500 mt-1">
              Build your basket and find the best nearby vendor
            </p>
          </div>
          {isLoading && <Loader2 className="animate-spin text-green-600" />}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* PRODUCTS */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Available for Estimation
          </h2>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {estimatorProducts.length === 0 && !isLoading ? (
              <p className="text-sm text-gray-400 italic">No products available for estimation...</p>
            ) : (
              estimatorProducts.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleProductAdd(p)}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-green-50 group transition-all duration-200 border border-transparent hover:border-green-100"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 group-hover:text-green-700">
                      {p.name}
                    </p>
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-tight">
                      {p.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      avg ₹{p.avgPrice.toFixed(0)}
                    </span>
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* BASKET */}
        <div className="flex flex-col items-center bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
          <motion.div
            animate={{ scale: basket.length ? 1.05 : 1 }}
            className="relative"
          >
            <div className="bg-white p-6 rounded-full shadow-lg shadow-green-100 border border-green-50">
              <ShoppingBasket size={64} className="text-green-600" />
            </div>
            {basket.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                {basket.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </motion.div>

          <div className="mt-8 w-full space-y-3">
            {basket.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm italic">
                  Your estimation basket is empty
                </p>
                <p className="text-[10px] text-gray-300 uppercase font-bold mt-2">
                  Add items from the list
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {basket.map((item, idx) => (
                    <div
                      key={item._id || `${item.name}-${idx}`}
                      className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromBasket(item._id, item.vendorId)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-600">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Avg. Subtotal
                    </span>
                    <span className="text-xl font-black text-gray-800">
                      ₹{basketTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={calculateBestVendor}
                  disabled={isCalculating}
                  className="w-full mt-4 bg-green-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isCalculating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Calculate Best Vendor"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* VENDORS */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {showVendors ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Top Vendor Recommendations
                </h2>

                <div className="space-y-4">
                  {estimatedVendors.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400">
                        No individual vendor found with all items in stock.
                      </p>
                    </div>
                  ) : (
                    estimatedVendors
                      .sort((a, b) => vendorTotal(a) - vendorTotal(b))
                      .map((v) => {
                        const total = vendorTotal(v);
                        const isBest = cheapest?.id === v.id;

                        return (
                          <div
                            key={v.id}
                            className={`p-5 rounded-2xl border-2 transition-all ${isBest
                              ? "border-green-500 bg-green-50/30 ring-4 ring-green-500/5 shadow-xl shadow-green-100"
                              : "border-gray-100 bg-white hover:border-gray-200"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-gray-800">
                                  {v.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {v.distance.toFixed(1)} km away
                                  </span>
                                  {isBest && (
                                    <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Check size={10} />
                                      CHEAPEST
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-black text-gray-900">
                                  ₹{total.toFixed(0)}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                  Total with Delivery
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100/50 flex flex-wrap gap-2">
                              {v.items.map((item, i) => (
                                <span key={i} className="text-[9px] font-bold text-gray-500 bg-white border border-gray-100 px-2 py-1 rounded-lg">
                                  {item.name} @ ₹{item.price}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale"
              >
                <div className="bg-gray-100 p-8 rounded-full mb-6">
                  <Check size={48} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Results will appear here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BasketEstimator;
