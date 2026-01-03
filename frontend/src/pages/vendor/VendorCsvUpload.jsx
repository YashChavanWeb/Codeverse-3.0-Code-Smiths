import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse"; // Import PapaParse for parsing
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
} from "../../components/ui";

const VendorCsvUpload = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file before submitting");
      return;
    }

    setLoading(true);

    // Parse CSV file
    Papa.parse(file, {
      header: true, // Assumes first row is name, category, price, etc.
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const products = results.data;

          // Use Promise.all to add all products from the CSV
          const uploadPromises = products.map((item) => {
            // Transform keys to match your backend schema
            const payload = {
              name: item.name,
              category: item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase(),
              price: Number(item.price),
              unit: item.unit || "kg",
              stock: Number(item.quantity || item.stock),
            };

            return axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/products`,
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          });

          await Promise.all(uploadPromises);

          alert(`Successfully uploaded ${products.length} products!`);
          navigate("/vendor/inventory");
        } catch (err) {
          console.error("Bulk upload error:", err);
          setError("Failed to upload products. Check your CSV formatting.");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError("Error parsing CSV: " + err.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background-alt flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Upload CSV</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Upload a CSV file to add multiple items at once
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* File input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  disabled={loading}
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {file && (
                  <p className="text-sm text-foreground-muted mt-1">
                    Selected file: {file.name}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{error}</p>
                )}
              </div>

              {/* CSV format hint */}
              <div className="text-sm text-foreground-muted bg-slate-50 rounded-md p-3 border border-slate-100">
                <p className="font-semibold text-slate-700 mb-1">Expected CSV Headers:</p>
                <code className="text-xs bg-white p-1 block border rounded mb-2">
                  name, category, price, unit, quantity
                </code>
                <p className="text-xs font-medium text-slate-500">
                  Example: Mango, Fruit, 200, kg, 140
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                  onClick={() => navigate("/vendor/add")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={loading || !file}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    "Upload CSV"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorCsvUpload;