import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBasket, Plus, Check } from "lucide-react";

const RATE_PER_KM = 5;

const vendors = [
  { id: 1, name: "GreenFresh", distance: 2.1 },
  { id: 2, name: "Veggie Hub", distance: 1.4 },
  { id: 3, name: "FarmDirect", distance: 3.2 },
];

const products = [
  { id: 1, name: "Tomato", price: 20 },
  { id: 2, name: "Potato", price: 15 },
  { id: 3, name: "Apple", price: 30 },
];

import { useBasket } from "../../context/BasketContext";

const BasketEstimator = () => {
  const { basket, addToBasket, basketTotal } = useBasket();
  const [showVendors, setShowVendors] = useState(false);

  const handleProductAdd = (product) => {
    setShowVendors(false);
    // Note: In real app, we'd need to know which vendor this "global" product belongs to
    // For now, we'll mimic the old behavior by assigning it to a dummy vendor if needed,
    // but ideally products in BasketEstimator should come from real vendors.
    addToBasket(product, { _id: "dummy", name: "General" });
  };

  const itemsTotal = basketTotal;

  const vendorTotal = (v) =>
    itemsTotal + v.distance * RATE_PER_KM;

  const cheapest =
    basket.length > 0
      ? vendors.reduce((a, b) =>
        vendorTotal(a) < vendorTotal(b) ? a : b
      )
      : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Basket Estimator
        </h1>
        <p className="text-gray-500 mt-1">
          Build your basket and find the best nearby vendor
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* PRODUCTS */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            Vegetables & Fruits
          </h2>

          <div className="space-y-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProductAdd(p)}
                className="w-full flex items-center justify-between py-3 border-b hover:text-green-600 transition"
              >
                <span className="font-medium">{p.name}</span>
                <span className="flex items-center gap-2 text-sm">
                  ₹{p.price}
                  <Plus size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* BASKET */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ scale: basket.length ? 1.1 : 1 }}
            className="relative"
          >
            <ShoppingBasket
              size={72}
              className="text-green-600"
            />
            {basket.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {basket.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </motion.div>

          <div className="mt-6 w-full text-sm space-y-2">
            {basket.length === 0 ? (
              <p className="text-center text-gray-400">
                Basket is empty
              </p>
            ) : (
              basket.map((item, idx) => (
                <div
                  key={item._id || `${item.name}-${idx}`}
                  className="flex justify-between"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))
            )}
          </div>

          {basket.length > 0 && (
            <button
              onClick={() => setShowVendors(true)}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Calculate Best Vendor
            </button>
          )}
        </div>

        {/* VENDORS */}
        <div>
          <AnimatePresence>
            {showVendors && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                  Vendor Prices
                </h2>

                <div className="space-y-4">
                  {vendors.map((v) => {
                    const total = vendorTotal(v);
                    const isBest =
                      cheapest?.id === v.id;

                    return (
                      <div
                        key={v.id}
                        className="flex justify-between items-center border-b pb-3"
                      >
                        <div>
                          <p className="font-medium">
                            {v.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {v.distance} km away
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{total.toFixed(0)}
                          </p>
                          {isBest && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Check size={12} />
                              Best deal
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BasketEstimator;
