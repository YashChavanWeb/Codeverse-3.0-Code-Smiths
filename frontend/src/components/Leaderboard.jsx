import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

import apple from "../assets/Images/apple.png";
import tomato from "../assets/Images/tomato.png";
import cabbage from "../assets/Images/cabbage.png";
import banana from "../assets/Images/banana.png";
import potato from "../assets/Images/potato.png";
import carrot from "../assets/Images/carrot.png";
import orange from "../assets/Images/orange.png";
import mango from "../assets/Images/mango.png";

// Dummy Data
const initialData = [
  { id: 1, name: "Tomato", image: tomato, price: 20, category: "Vegetable", stock: 120, unit: "kg" },
  { id: 2, name: "Potato", image: potato, price: 15, category: "Vegetable", stock: 80, unit: "kg" },
  { id: 3, name: "Apple", image: apple, price: 25, category: "Fruit", stock: 60, unit: "kg" },
  { id: 4, name: "Carrot", image: carrot, price: 18, category: "Vegetable", stock: 40, unit: "kg" },
  { id: 5, name: "Banana", image: banana, price: 12, category: "Fruit", stock: 150, unit: "dozen" },
  { id: 6, name: "Cabbage", image: cabbage, price: 10, category: "Vegetable", stock: 30, unit: "piece" },
  { id: 7, name: "Orange", image: orange, price: 22, category: "Fruit", stock: 55, unit: "kg" },
  { id: 8, name: "Mango", image: mango, price: 30, category: "Fruit", stock: 25, unit: "kg" },
];

const PAGE_SIZE = 5;

const LeaderBoard = () => {
  const [data, setData] = useState(initialData);
  const [prevPrices, setPrevPrices] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const map = {};
    initialData.forEach(item => (map[item.id] = item.price));
    setPrevPrices(map);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPrices(
        data.reduce((acc, item) => {
          acc[item.id] = item.price;
          return acc;
        }, {})
      );

      setData(prev =>
        prev.map(item => {
          const change = Math.floor(Math.random() * 10) - 5;
          return { ...item, price: Math.max(item.price + change, 1) };
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [data]);

  const sortedData = [...data].sort((a, b) => b.price - a.price);

  const filteredData = sortedData.filter(item => {
    if (filter === "increased") return item.price > prevPrices[item.id];
    if (filter === "reduced") return item.price < prevPrices[item.id];
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "increased", "reduced"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${filter === type ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {type === "all" ? "All" : type === "increased" ? "Price Increased" : "Price Reduced"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Unit</th>
              <th className="p-4 text-left">Price (₹)</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {paginatedData.map(item => {
                const priceUp = prevPrices[item.id] < item.price;
                const priceDown = prevPrices[item.id] > item.price;
                const lowStock = item.stock < 40;

                return (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="border-b hover:bg-gray-50"
                  >
                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg" />
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Fresh Market Produce</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-medium text-gray-700">
                      {item.category}
                    </td>

                    {/* Stock */}
                    <td className={`p-4 font-semibold ${lowStock ? "text-red-600" : "text-green-600"}`}>
                      {item.stock}
                    </td>

                    {/* Unit */}
                    <td className="p-4 text-gray-600">
                      {item.unit}
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold">
                        ₹{item.price}
                        {priceUp && <ArrowUp className="w-4 h-4 text-red-600" />}
                        {priceDown && <ArrowDown className="w-4 h-4 text-green-600" />}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm font-medium">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaderBoard;
