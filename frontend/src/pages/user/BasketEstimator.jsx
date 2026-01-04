import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBasket, Plus, Check, Loader2, X } from "lucide-react";
import axios from "axios";
import { useBasket } from "../../context/BasketContext";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input } from "../../components/ui";
import logo from '../../assets/Images/logo.png';

const RATE_PER_KM = 5;

const BasketEstimator = () => {
  const { basket, addToBasket, removeFromBasket, basketTotal } = useBasket();
  const { token } = useAuth();

  const [showVendors, setShowVendors] = useState(false);
  const [estimatorProducts, setEstimatorProducts] = useState([]);
  const [estimatedVendors, setEstimatedVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [search, setSearch] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch products for estimation
  useEffect(() => {
    const fetchEstimatorProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${BASE_URL}/basket/estimator-products`);
        if (res.data.success) setEstimatorProducts(res.data.data);
      } catch (err) {
        console.error("Error fetching estimator products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstimatorProducts();
  }, [BASE_URL]);

  // Add product to basket
  const handleProductAdd = async (product) => {
    setShowVendors(false);

    addToBasket(
      { _id: `temp-${product.name}`, name: product.name, price: product.avgPrice },
      { _id: "dummy", name: "General" }
    );

    if (token) {
      try {
        await axios.post(
          `${BASE_URL}/basket/add`,
          { productName: product.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error signaling demand:", err);
      }
    }
  };

  // Calculate best vendor
  const calculateBestVendor = async () => {
    if (!basket.length) return;
    try {
      setIsCalculating(true);
      const items = basket.map((item) => ({ name: item.name, qty: item.qty }));
      const res = await axios.post(`${BASE_URL}/basket/estimate`, { items });
      if (res.data.success) {
        const enrichedVendors = res.data.data.map((v, idx) => ({
          ...v,
          distance: (idx + 1) * 1.2, // mock distance
        }));
        setEstimatedVendors(enrichedVendors);
        setShowVendors(true);
      }
    } catch (err) {
      console.error("Error calculating best vendor:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const vendorTotal = (v) => v.totalPrice + v.distance * RATE_PER_KM;
  const cheapest = estimatedVendors.length
    ? estimatedVendors.reduce((a, b) => (vendorTotal(a) < vendorTotal(b) ? a : b))
    : null;

  const filteredProducts = estimatorProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full mx-auto px-10 py-10">
      {/* HEADER */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Basket Estimator</h1>
          <p className="text-gray-500 mt-1">
            Build your basket and find the best nearby vendor
          </p>
        </div>
        {isLoading && <Loader2 className="animate-spin text-green-600" />}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start h-[75vh]">
        {/* PRODUCTS */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Available for Estimation
          </h2>

          <Input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-2 h-100 overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No matching products...</p>
            ) : (
              filteredProducts.map((p) => (
                <motion.div key={p.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <div
                    onClick={() => handleProductAdd(p)}
                    className="cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 hover:border-green-200 shadow-sm hover:shadow-md flex justify-between items-center transition-all"
                  >
                    <div>
                      <p className="font-semibold text-gray-700">{p.name}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold">
                        {p.category}
                      </p>
                    </div>
                    <Plus size={18} className="text-green-600" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* BASKET */}
        <Card variant='glass' className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center">
          <motion.div animate={{ scale: basket.length ? 1.05 : 1 }} className="relative">
            <div className="bg-green-50 p-6 rounded-full">
              <ShoppingBasket size={50} className="text-green-600" />
            </div>
            {basket.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                {basket.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </motion.div>

          <div className="mt-8 w-full">
            {basket.length === 0 ? (
                <div className="flex flex-col justify-center items-center text-center p-8 bg-gray-50/70 rounded-2xl border-2 border-dashed border-gray-400 mx-auto">
                      <img src={logo} className="w-15 h-15"></img>
              <p className="text-center text-gray-400 italic py-10">Your estimation basket is empty</p>
              </div>
            ) : (
              <>
                <div className="h-50 overflow-y-auto space-y-2 pr-2">
                  <AnimatePresence>
                    {basket.map((item, idx) => (
                      <motion.div
                        key={item._id || `${item.name}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center bg-white p-3 rounded-xl shadow"
                      >
                        <div className="w-full flex flex-row-reverse justify-between items-center gap-2">
                          <button
                            onClick={() => removeFromBasket(item._id, item.vendorId)}
                            className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <X size={14} />
                          </button>
                          <div>
                            <p className="text-[14px] font-semibold text-gray-700 italic">{item.name}</p>
                            <p className="text-[14px] text-gray-700">Qty: {item.qty}</p>
                          </div>
                        </div>
                        {/* <span className="font-bold text-gray-700">₹{item.price * item.qty}</span> */}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* <div className="mt-4 flex justify-between items-center border-t border-dashed pt-4">
                  <span className="text-sm font-bold text-gray-400 uppercase">Avg Subtotal</span>
                  <span className="text-xl font-black text-gray-800">₹{basketTotal.toFixed(0)}</span>
                </div> */}

                <Button
                  onClick={calculateBestVendor}
                  disabled={isCalculating}
                  className="w-full mt-4 bg-green-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all flex justify-center gap-2"
                >
                  {isCalculating ? <Loader2 size={20} className="animate-spin" /> : "Calculate Best Vendor"}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* VENDORS */}
        <div className="h-100">
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
                    <div className="flex flex-col justify-center items-center text-center p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mx-auto">
                      <img src={logo} className="w-15 h-15"></img>
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
                                <p className="text-lg font-bold text-gray-900">
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
