import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ImageIcon } from "lucide-react"; // Added ImageIcon
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
} from "../../components/ui";

const VendorAddOptions = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

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

  // 🔹 Updated Table Columns to include Image
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
            <span className="font-bold text-slate-700 leading-tight">
              {row.name}
            </span>
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-extrabold mt-0.5">
              {row.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      cell: (row) => `₹${row.price}/${row.unit}`,
    },
    {
      header: "Stock Status",
      cell: (row) => {
        const stockCount = row.stock?.current ?? row.stock;
        const isAvailable = row.available && stockCount > 0;
        return (
          <span
            className={`font-medium ${isAvailable ? "text-green-600" : "text-red-600"
              }`}
          >
            {isAvailable ? "Available" : "Out of Stock"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background-alt px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ================= TOP SECTION ================= */}
        <Card>
          <CardHeader>
            <h2 className="text-3xl font-semibold">Manage Your Inventory</h2>
            <p className="text-foreground-muted text-sm mt-1">
              Add or update fruits and vegetables using the options below
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3">Manual Entry</h3>
                <p className="text-sm text-foreground-muted mb-6">
                  Add items one by one with full control over price and stock.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/vendor/add/manual")}
                >
                  Add Manually
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3">CSV Upload</h3>
                <p className="text-sm text-foreground-muted mb-6">
                  Upload multiple products instantly using a CSV file.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/vendor/add/csv")}
                >
                  Upload CSV
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-3">Voice Input</h3>
                <p className="text-sm text-foreground-muted mb-6">
                  Speak product details and add items hands-free.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/vendor/add/voice")}
                >
                  Use Voice
                </Button>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* ================= BOTTOM SECTION ================= */}
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-semibold">Your Products</h3>
            <p className="text-sm text-foreground-muted">
              Live view of items visible to customers
            </p>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <Table columns={columns} data={products} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAddOptions;