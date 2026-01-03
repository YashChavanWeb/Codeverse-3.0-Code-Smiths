import React, { useState, useMemo } from "react";
import basketImg from "../../assets/Images/basket.png";
import { Plus } from "lucide-react";

// UI Components
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

import { useBasket } from "../../context/BasketContext";

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

const BasketEstimator = () => {
  const [search, setSearch] = useState("");
  const { basket, addToBasket, removeFromBasket, basketTotal } = useBasket();
  const [showVendors, setShowVendors] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const totalItems = basket.reduce((sum, item) => sum + item.qty, 0);

  const vendorTotal = (vendor) => basketTotal + vendor.distance * RATE_PER_KM;

  const cheapestVendor = basket.length
    ? vendors.reduce((a, b) => (vendorTotal(a) < vendorTotal(b) ? a : b))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Basket Estimator</h1>
        <p className="text-gray-500 mt-1">
          Build your basket and find the best nearby vendor
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* PRODUCTS */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Search & Add Items</h2>
          <Input
            placeholder="Search vegetables or fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 space-y-2">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToBasket(p)}
                className="w-full flex items-center justify-between py-3 border-b hover:text-green-600 transition"
              >
                <span className="font-medium">{p.name}</span>
                <span className="flex items-center gap-2 text-sm">
                  ₹{p.price} <Plus size={16} />
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* BASKET SUMMARY */}
        <div className="relative flex flex-col items-center w-full">
          <div className="relative z-10 mb-4">
            <Button
              size="lg"
              disabled={basket.length === 0}
              onClick={() => setShowVendors(true)}
              className="shadow-lg shadow-green-500/40"
            >
              Find Best Vendor
            </Button>
          </div>

          <img src={basketImg} alt="Basket" className="w-24 h-24 mb-4" />

          {basket.length > 0 && (
            <div className="w-64 bg-white p-4 rounded-md shadow-md border border-gray-200">
              <h3 className="font-medium text-center mb-3">Basket Summary</h3>
              {basket.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeFromBasket(item.id)}
                    >
                      −
                    </Button>
                    <span>{item.qty}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => addToBasket(item)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-3 border-t pt-2 flex justify-between font-semibold">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
            </div>
          )}
        </div>

        {/* VENDOR COMPARISON */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vendor Comparison</h2>
          {!showVendors ? (
            <p className="text-sm text-gray-400">
              Add items and calculate to view vendors
            </p>
          ) : (
            vendors.map((v) => {
              const total = vendorTotal(v);
              const isBest = cheapestVendor?.id === v.id;
              return (
                <div
                  key={v.id}
                  className={`border rounded p-4 mb-3 ${
                    isBest ? "border-green-600 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.distance} km away</p>
                    </div>
                    <p className="font-semibold">₹{total.toFixed(0)}</p>
                  </div>
                  {isBest && (
                    <p className="text-green-600 text-xs mt-2">
                      ✅ Best price in your vicinity
                    </p>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
};

export default BasketEstimator;
