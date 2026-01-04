import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// UI Components
import { Button } from "../../components/ui";
import VendorLeaderboard from "../../components/VendorLeaderboard";

// Context
import { useAuth } from "../../context/AuthContext";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Local State
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Endpoints
  const PROFILE_URL = `${import.meta.env.VITE_BACKEND_URL}/auth/me`;
  const PRODUCTS_STREAM_URL = `${import.meta.env.VITE_BACKEND_URL}/products/stream`;
  const VENDOR_LEADERBOARD_URL = `${import.meta.env.VITE_BACKEND_URL}/products/vendor-leaderboard`;

  /* ---------------- FETCH USER PROFILE ---------------- */
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data.user);
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        setError("Failed to load vendor profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, PROFILE_URL]);

  /* ---------------- DATA PREP ---------------- */
  const username = userData?.username || "Vendor";
  const userInitial = username.charAt(0).toUpperCase();
  const storeDisplayName = userData?.storeName || "your store";
  const userCity = userData?.location?.address || userData?.location || "Unknown Location";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 mb-20">

      {/* 1. Welcome Section (Vendor Styled) */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transform -rotate-3">
            {userInitial}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {username}!
            </h2>
            <p className="text-gray-500">
              Managing <span className="font-medium text-green-600">{storeDisplayName}</span> • {userCity}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => navigate("/add-product")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-md"
          >
            + Add Product
          </Button>
          <Button
            onClick={() => navigate("/my-products")}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
          >
            My Inventory
          </Button>
        </div>
      </section>

      {/* 2. Vendor Leaderboard Section */}
      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
          <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Market Standings</h3>
              <p className="text-xs text-gray-500">How your store compares to others in {userCity}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-700 text-xs font-semibold tracking-wide uppercase">
                Live Area Rankings
              </span>
            </div>
          </div>

          <div className="w-full">
            <VendorLeaderboard
              title="Regional Vendor Rankings"
              fetchUrl={VENDOR_LEADERBOARD_URL}
              streamUrl={PRODUCTS_STREAM_URL}
              pageSize={10}
              showCityFilter={true}
            />
          </div>
        </section>
      </div>

      {/* 3. Error Feedback */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;