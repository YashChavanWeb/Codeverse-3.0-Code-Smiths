import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ImageIcon, X, Check, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Table,
} from "../../components/ui";

const VendorCsvUpload = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // States for Preview and Image Fetching
  const [previewData, setPreviewData] = useState([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      setFile(null);
      setPreviewData([]);
      return;
    }

    setError("");
    setFile(selectedFile);
    parseFileForPreview(selectedFile);
  };

  const parseFileForPreview = (selectedFile) => {
    setIsSearchingImages(true);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawProducts = results.data;

        const enrichedProducts = await Promise.all(
          rawProducts.map(async (item) => {
            let autoImageUrl = "";
            const queryName = item.name ? item.name.trim() : "";

            try {
              // 🔹 Logic from Manual Add: Search globally if name >= 3 chars
              if (queryName.length >= 3) {
                const res = await axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/products/lookup-image`,
                  { params: { name: queryName } }
                );
                if (res.data.success && res.data.imageUrl) {
                  autoImageUrl = res.data.imageUrl;
                }
              }
            } catch (err) {
              autoImageUrl = ""; // Not found
            }

            return {
              ...item,
              name: queryName,
              // Fix: Fallback to placeholder to prevent "imageUrl is required" 500 error
              imageUrl: autoImageUrl || "https://via.placeholder.com/150?text=No+Image",
              hasMatched: !!autoImageUrl,
              _id: Math.random().toString(36).substr(2, 9),
              // Defaulting fields to ensure payload is never empty
              price: item.price || 0,
              quantity: item.quantity || item.stock || 0,
              unit: item.unit || "kg",
              category: item.category || "Vegetable"
            };
          })
        );

        setPreviewData(enrichedProducts);
        setIsSearchingImages(false);
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewData.length) return;

    setLoading(true);
    setError("");

    try {
      // Process sequentially to avoid 429/500 errors and ensure logic flow
      for (const item of previewData) {
        const payload = {
          name: item.name,
          category: item.category
            ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase()
            : "Vegetable",
          price: Number(item.price),
          unit: item.unit,
          stock: Number(item.quantity),
          imageUrl: item.imageUrl, // Already validated in parse step
          available: true,
        };

        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/products`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert(`Successfully uploaded ${previewData.length} products!`);
      navigate("/vendor/inventory");
    } catch (err) {
      console.error("Bulk upload error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        "Failed to upload products. Ensure price and quantity are numbers."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: "name",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">{row.name}</span>
            <span className="text-[10px] uppercase text-slate-400 font-extrabold">
              {row.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      cell: (row) => (
        <span className="font-medium text-slate-600 text-sm">
          ₹{row.price}/{row.unit}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: "quantity",
      cell: (row) => (
        <span className="text-sm text-slate-600">
          {row.quantity} {row.unit}
        </span>
      ),
    },
    {
      header: "Auto-Match",
      accessor: "hasMatched",
      cell: (row) => (
        row.hasMatched ? (
          <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase tracking-widest">
            <Check className="w-3 h-3" /> Image Linked
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] uppercase tracking-widest">
            <Search className="w-3 h-3" /> Generic Used
          </div>
        )
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-6 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bulk CSV Upload</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Upload multiple products. Images are auto-matched from our library.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-50">
              <div className="flex flex-col gap-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      {isSearchingImages ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {file ? file.name : "Click to upload CSV or drag and drop"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-extrabold">
                      {isSearchingImages ? "Scanning database for matches..." : "Max file size 5MB"}
                    </p>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
              </div>
            </div>

            {previewData.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <Table columns={columns} data={previewData} />
                </div>

                <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Total Items detected
                    </span>
                    <span className="text-sm font-bold text-slate-700">{previewData.length} Products</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/vendor/inventory")}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || isSearchingImages}
                      className="px-6 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Confirm & Upload"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!previewData.length && (
              <div className="p-6">
                <div className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Required Columns:</p>
                  <p className="text-xs leading-relaxed text-slate-400 font-mono">
                    name, price, quantity, category, unit
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorCsvUpload;