import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import your auth hook
import { ImageIcon, Loader2, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
} from "../../components/ui";

const VendorManualAdd = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token for the header

  const [formData, setFormData] = useState({
    category: "vegetable",
    name: "",
    price: "",
    quantity: "", // This will be sent as 'stock'
    unit: "kg",     // Added to match backend requirements
    available: true,
    imageUrl: "",   // Track the auto-fetched image
  });

  const [loading, setLoading] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  // 🔹 Effect to search for an existing product image globally
  useEffect(() => {
    const fetchExistingImage = async () => {
      const queryName = formData.name.trim();

      // Clear image and exit if name is too short
      if (queryName.length < 3) {
        setFormData(prev => ({ ...prev, imageUrl: "" }));
        return;
      }

      setIsFetchingImage(true);
      try {
        // Calling your new lookup endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products/lookup-image`,
          { params: { name: queryName } }
        );

        if (response.data.success && response.data.imageUrl) {
          setFormData((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
        } else {
          setFormData((prev) => ({ ...prev, imageUrl: "" }));
        }
      } catch (error) {
        // 404 or errors simply mean no image found
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
      } finally {
        setIsFetchingImage(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchExistingImage();
    }, 800); // 800ms debounce

    return () => clearTimeout(debounceTimer);
  }, [formData.name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mapping frontend state to backend requirements
      const payload = {
        name: formData.name,
        category: formData.category.charAt(0).toUpperCase() + formData.category.slice(1), // Capitalize
        price: Number(formData.price),
        unit: formData.unit,
        stock: Number(formData.quantity),
        imageUrl: formData.imageUrl, // Include fetched image in payload
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.data) {
        alert("Product added successfully!");
        navigate("/vendor/inventory"); // Navigate to your list page
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-alt flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Add Item Manually</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Enter details of the fruit or vegetable
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Image Preview Box (Matches your visual logic) */}
              <div className="flex justify-center mb-2">
                <div className="group relative h-32 w-32 rounded-3xl border-2 border-dashed border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Fetched Product"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : isFetchingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Searching...</span>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-slate-200 mx-auto" />
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">Auto-fetching Image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md" // Added basic styling to match Input
                >
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                </select>
              </div>

              {/* Item Name */}
              <div className="relative">
                <Input
                  label="Item Name"
                  name="name"
                  placeholder="Tomato"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div className="absolute right-3 top-[38px]">
                  {isFetchingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-300" />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                {/* Price */}
                <div className="flex-1">
                  <Input
                    label="Price (₹)"
                    name="price"
                    type="number"
                    placeholder="40"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Unit Select - Necessary for backend */}
                <div className="w-1/3">
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md text-sm h-[40px]"
                  >
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
              </div>

              {/* Quantity (Stock) */}
              <Input
                label="Quantity (Stock)"
                name="quantity"
                type="number"
                placeholder="10"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              {/* Availability */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                <label htmlFor="available" className="text-sm">Available for sale</label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/vendor/add")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={loading || isFetchingImage}>
                  {loading ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorManualAdd;