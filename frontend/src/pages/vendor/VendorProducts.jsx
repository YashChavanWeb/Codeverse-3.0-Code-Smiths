import React, { useEffect, useState, useRef } from "react";
import { Pencil, Check, X, Loader2, Power, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent, Table } from "../../components/ui";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const VendorProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const priceInputRef = useRef(null);
  const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;

  // 🔹 Axios Header Configuration
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 🔹 Fetch Products from API
  const fetchProducts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/location`, config);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // 🔹 Auto-focus on price input when editing starts
  useEffect(() => {
    if (editingId && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      price: product.price,
      stock: product.stock?.current ?? product.stock,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ price: "", stock: "" });
  };

  // 🔹 Toggle Manual Availability (PATCH /:id/available)
  const toggleAvailability = async (product) => {
    const newStatus = !product.available;
    try {
      // Optimistic Update
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, available: newStatus } : p))
      );

      await axios.patch(`${BASE_URL}/${product._id}/available`, { available: newStatus }, config);
    } catch (error) {
      console.error("Failed to update availability", error);
      alert("Unauthorized or Session Expired");
      fetchProducts(); // Rollback
    }
  };

  // 🔹 Save Changes (Handles Parallel Queue Requests)
  const saveEdit = async (product) => {
    setIsSaving(true);
    const id = product._id;
    const newPrice = Number(editData.price);
    const newStock = Number(editData.stock);
    const currentStock = product.stock?.current ?? product.stock;

    try {
      const requests = [];

      // 1. Queue Price Update if changed
      if (newPrice !== product.price) {
        requests.push(axios.patch(`${BASE_URL}/${id}/price`, { price: newPrice }, config));
      }

      // 2. Queue Stock Update if changed
      if (newStock !== currentStock) {
        requests.push(axios.patch(`${BASE_URL}/${id}/stock`, { stock: newStock }, config));

        // 3. Auto-disable availability if stock hit 0
        if (newStock === 0 && product.available) {
          requests.push(axios.patch(`${BASE_URL}/${id}/available`, { available: false }, config));
        }
      }

      if (requests.length > 0) {
        await Promise.all(requests);

        // Optimistic UI Update (reflecting changes immediately)
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id
              ? {
                ...p,
                price: newPrice,
                stock: { ...p.stock, current: newStock },
                available: newStock > 0 ? p.available : false,
                updatedAt: new Date().toISOString(),
              }
              : p
          )
        );
      }
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save changes:", error);
      const msg = error.response?.status === 401 ? "Unauthorized. Please login again." : "Failed to queue updates.";
      alert(msg);
      fetchProducts(); // Rollback to server state
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: "name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{row.name}</span>
          <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">
            {row.category}
          </span>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      cell: (row) =>
        editingId === row._id ? (
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-sm">₹</span>
            <input
              ref={priceInputRef}
              type="number"
              className="border border-blue-200 px-2 py-1 rounded w-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
            />
          </div>
        ) : (
          <span className="font-medium text-slate-600 text-sm">
            ₹{row.price}/{row.unit}
          </span>
        ),
    },
    {
      header: "Stock",
      accessor: "stock",
      cell: (row) => {
        const currentVal = row.stock?.current ?? row.stock;
        return editingId === row._id ? (
          <input
            type="number"
            className="border border-blue-200 px-2 py-1 rounded w-20 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={editData.stock}
            onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${currentVal < 10 ? "text-orange-500 font-bold" : "text-slate-600"}`}>
              {currentVal} {row.unit}
            </span>
            {currentVal < 10 && <AlertCircle className="w-3 h-3 text-orange-400" />}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "available",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span
            className={`font-medium px-2 py-0.5 rounded-full text-[11px] ${row.available ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              }`}
          >
            {row.available ? "Live" : "Hidden"}
          </span>
          <button
            onClick={() => toggleAvailability(row)}
            className={`p-1 rounded-md transition-colors ${row.available ? "text-slate-300 hover:text-red-400" : "text-green-500 hover:bg-green-100"
              }`}
            title={row.available ? "Hide from Store" : "Show in Store"}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) =>
        editingId === row._id ? (
          <div className="flex gap-1">
            <button
              disabled={isSaving}
              onClick={() => saveEdit(row)}
              className="hover:bg-green-100 p-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              ) : (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </button>
            <button onClick={cancelEdit} className="hover:bg-red-100 p-1.5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startEdit(row)}
            className="hover:bg-blue-100 p-1.5 rounded-lg transition-colors group"
          >
            <Pencil className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-6 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Manager</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Updates are processed via queue to ensure data consistency
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isSaving && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                      Syncing Changes...
                    </span>
                  </div>
                )}
                <button
                  onClick={fetchProducts}
                  className="p-2 hover:bg-slate-50 rounded-full transition-all active:scale-95 border border-slate-100"
                >
                  <Loader2 className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading && products.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium">Fetching your products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 text-center">
                <p className="text-slate-400">No products found for this location.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table columns={columns} data={products} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProducts;