import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import your auth hook
import { Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
} from "../../components/ui";

const VendorAddOptions = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token for the header

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 API Configuration
  const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 🔹 Fetch Products from Backend
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

  // 🔹 Table Columns (3 Columns as requested)
  const columns = [
    {
      header: "Product Name",
      accessor: "name"
    },
    {
      header: "Price",
      cell: (row) => `₹${row.price}/${row.unit}`
    },
    {
      header: "Stock Status",
      cell: (row) => {
        const stockCount = row.stock?.current ?? row.stock;
        const isAvailable = row.available && stockCount > 0;
        return (
          <span className={`font-medium ${isAvailable ? "text-green-600" : "text-red-600"}`}>
            {isAvailable ? "Available" : "Out of Stock"}
          </span>
        );
      }
    },
  ];

  return (
    <div className="min-h-screen bg-background-alt px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ================= TOP SECTION ================= */}
        <Card>
          <CardHeader>
            <h2 className="text-3xl font-semibold">
              Manage Your Inventory
            </h2>
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