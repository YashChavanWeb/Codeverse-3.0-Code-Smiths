import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
} from "../../components/ui";

const VendorManualAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "vegetable",
    name: "",
    price: "",
    quantity: "",
    available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitted item:", formData);

    // later: API call goes here

    navigate("/vendor/add");
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
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                </select>
              </div>

              {/* Item Name */}
              <Input
                label="Item Name"
                name="name"
                placeholder="Tomato"
                value={formData.name}
                onChange={handleChange}
                required
              />

              {/* Price */}
              <Input
                label="Price (₹)"
                name="price"
                type="number"
                placeholder="40"
                value={formData.price}
                onChange={handleChange}
                required
              />

              {/* Quantity */}
              <Input
                label="Quantity (kg / units)"
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
                  checked={formData.available}
                  onChange={handleChange}
                />
                <span className="text-sm">Available for sale</span>
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
                <Button type="submit" className="w-full">
                  Add Item
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
