import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
} from "../../components/ui";

const VendorAddOptions = () => {
  const navigate = useNavigate();

  // 🔹 Table Columns
  const columns = [
    { header: "Product Name", accessor: "name" },
    { header: "Price", accessor: "price" },
    { header: "Stock Status", accessor: "status" },
  ];

  // 🔹 Table Data (later replace with backend API response)
  const productData = [
    {
      name: "Tomato",
      price: "₹30/kg",
      status: <span className="text-green-600 font-medium">Available</span>,
    },
    {
      name: "Onion",
      price: "₹40/kg",
      status: <span className="text-red-600 font-medium">Out of Stock</span>,
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
            <Table columns={columns} data={productData} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default VendorAddOptions;
