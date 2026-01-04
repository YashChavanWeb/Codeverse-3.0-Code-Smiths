  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";

  // UI Components
  import { Button, Card } from "../../components/ui";
  import Leaderboard from "../../components/Leaderboard";

  // Context
  import { useAuth } from "../../context/AuthContext";

  const Dashboard = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    // Local State
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API Endpoints
    const PROFILE_URL = `${import.meta.env.VITE_BACKEND_URL}/auth/me`;
    const LEADERBOARD_URL = `${import.meta.env.VITE_BACKEND_URL}/products/leaderboard`;
    const STREAM_URL = `${import.meta.env.VITE_BACKEND_URL}/products/stream`;

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
          console.error("Error fetching profile on Dashboard:", err);
          setError("Failed to load user profile.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }, [token, PROFILE_URL]);

    /* ---------------- DATA PREP ---------------- */
    const username = userData?.username || "User";
    const userInitial = username.charAt(0).toUpperCase();
    const isVendor = userData?.role === "vendor";
    const storeDisplayName = userData?.storeName || "your store";

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 mb-20 mt-0 md:mt-10">

        {/* 1. Welcome Section */}
        <Card variant="glass" className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border-2 mt-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transform -rotate-3">
              {userInitial}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome back, {username}!
              </h2>
              <p className="text-gray-500">
                {isVendor
                  ? `Vendor Portal • ${storeDisplayName}`
                  : "Market Observer • Real-time Insights"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {isVendor && (
              <Button
                onClick={() => navigate("/inventory")}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Manage Inventory
              </Button>
            )}
            <Button onClick={() => navigate("/profile")} variant="ghost">
              Profile Settings
            </Button>
          </div>
        </Card>

        {/* 2. Leaderboard Section */}
        <div className="grid grid-cols-1 gap-8">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <div className="p-5 border-b bg-gray-50/50 flex justify-between items-center bg-linear-to-br from-green-50/80 via-green-600/20 to green-50/80">
              <div>
                <h3 className="font-bold text-gray-800">Market Leaderboard</h3>
                <p className="text-xs text-gray-500">Live rankings based on stock health and availability</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-pulse">
                Live Updates
              </span>
            </div>

            <div className="w-full">
              {/* CRITICAL FIX: Changed fetchUrl to use the Leaderboard endpoint.
                  The leaderboard expects data from getVendorLeaderboard in your controller.
              */}
              <Leaderboard
                title="Vendor Rankings"
                fetchUrl={LEADERBOARD_URL}
                streamUrl={STREAM_URL}
                pageSize={5}
              />
            </div>
          </section>
        </div>

        {/* 3. Error Handling (Optional UI) */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  };

  export default Dashboard;