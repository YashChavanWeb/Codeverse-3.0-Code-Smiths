import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, List } from "lucide-react";
import axios from "axios";

// UI Components
import Leaderboard from "../../components/Leaderboard";
import { useAuth } from "../../context/AuthContext";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]); // To store vendor list
  const [selectedVendor, setSelectedVendor] = useState(null); // To store selected vendor

  // Endpoints
  const PROFILE_URL = `${import.meta.env.VITE_BACKEND_URL}/auth/me`;
  const VENDOR_PRODUCTS_FETCH_URL = `${import.meta.env.VITE_BACKEND_URL}/products/location`;
  const PRODUCTS_STREAM_URL = `${import.meta.env.VITE_BACKEND_URL}/products/stream`;
  const VENDOR_VENDORS_WITH_PRODUCTS_URL = `${import.meta.env.VITE_BACKEND_URL}/products/vendors-with-products`;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get(PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token, PROFILE_URL]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(VENDOR_VENDORS_WITH_PRODUCTS_URL);
        setVendors(response.data.data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };
    fetchVendors();
  }, []);

  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const username = userData?.username || "Vendor";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Simple Clean Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-5 md:mt-18">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome back, {username}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-products")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <List size={18} />
            My Products
          </button>
          <button
            onClick={() => navigate("/add-product")}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {/* Vendor Dropdown for Filter */}
      <div className="mb-4">
        <label htmlFor="vendor-select" className="block text-gray-700 font-medium mb-2">
          Select Vendor
        </label>
        <select
          id="vendor-select"
          className="w-full p-2.5 border border-gray-300 rounded-md"
          onChange={handleVendorChange}
          value={selectedVendor || ""}
        >
          <option value="">All Vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Leaderboard Table Container */}
      <div className="bg-white rounded-[1.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

        <Leaderboard
          title="Product Inventory"
          fetchUrl={`${import.meta.env.VITE_BACKEND_URL}/products/vendor/my-products`} // Use vendor filter URL
          streamUrl={PRODUCTS_STREAM_URL}
          pageSize={10}
          vendorId={selectedVendor}
        />
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          {/* Real-time tracking active */}
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;