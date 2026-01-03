import React, { useEffect, useState, useRef } from "react";
import { Pencil, Check, X, Loader2, Power, AlertCircle, ChevronLeft, ChevronRight, ImageIcon, Ghost } from "lucide-react";
import { Card, CardHeader, CardContent, Table, Button } from "../../components/ui";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const VendorProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ price: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🔹 Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const priceInputRef = useRef(null);
  const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 🔹 Updated Fetch with Page Params
  const fetchProducts = async (page = currentPage) => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/location?page=${page}&limit=${limit}`, config);
      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.pages);
        setCurrentPage(response.data.page);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [token, currentPage]);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

  const toggleAvailability = async (product) => {
    const newStatus = !product.available;
    try {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, available: newStatus } : p))
      );
      await axios.patch(`${BASE_URL}/${product._id}/available`, { available: newStatus }, config);
    } catch (error) {
      console.error("Failed to update availability", error);
      alert("Unauthorized or Session Expired");
      fetchProducts();
    }
  };

  const saveEdit = async (product) => {
    setIsSaving(true);
    const id = product._id;
    const newPrice = Number(editData.price);
    const newStock = Number(editData.stock);
    const currentStock = product.stock?.current ?? product.stock;

    try {
      const requests = [];
      if (newPrice !== product.price) {
        requests.push(axios.patch(`${BASE_URL}/${id}/price`, { price: newPrice }, config));
      }
      if (newStock !== currentStock) {
        requests.push(axios.patch(`${BASE_URL}/${id}/stock`, { stock: newStock }, config));
        if (newStock === 0 && product.available) {
          requests.push(axios.patch(`${BASE_URL}/${id}/available`, { available: false }, config));
        }
      }

      if (requests.length > 0) {
        await Promise.all(requests);
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
      fetchProducts();
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: "name",
      cell: (row) => (
        <div className="flex items-center gap-4">
          {/* 🔹 Image Container */}
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=No+Image";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>

          {/* 🔹 Text Details */}
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 leading-tight">{row.name}</span>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-extrabold mt-0.5">
              {row.category}
            </span>
          </div>
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
    <div className="min-h-screen bg-slate-50/50 px-4 py-10  text-slate-900">
      <div className="max-w-6xl mx-auto">
        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="border-b border-2 border-slate-300 p-6 bg-linear-to-br from-green-50/80 via-green-600/20 to green-50/80 rounded-t-md">
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
                <Button
                variant='ghost'
                  onClick={() => fetchProducts(currentPage)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-all active:scale-95 border border-slate-100"
                >
                  <Loader2 className={`w-4 h-4 text-green-900 ${loading ? "animate-spin" : ""}`} />
                </Button>
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
              <>
                <div className="overflow-x-auto">
                  <Table columns={columns} data={products} />
                </div>

                <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-white">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Page {currentPage} of {totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="p-1.5 rounded-md border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currentPage === pageNum
                              ? "bg-green-700 shadow-md shadow-blue-200"
                              : "bg-green-200 text-slate-400 hover:bg-slate-50"
                              } `}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="p-1.5 rounded-md border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProducts;