import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// UI Components
import { Button } from "../../components/ui";
import Leaderboard from "../../components/Leaderboard";

// Context
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Only taking token from context as per your AuthProvider

  // Local State for User Data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define API Endpoints
  const PROFILE_URL = `${import.meta.env.VITE_BACKEND_URL}/auth/me`;
  const PRODUCTS_FETCH_URL = `${import.meta.env.VITE_BACKEND_URL}/products/location`;
  const PRODUCTS_STREAM_URL = `${import.meta.env.VITE_BACKEND_URL}/products/stream`;

  /* ---------------- FETCH USER PROFILE ---------------- */
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, PROFILE_URL]);

  /* ---------------- DATA MAPPING ---------------- */
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
    <div className="p-4 md:p-8 max-w-full mx-auto w-full space-y-8 mb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
            {userInitial}
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              Welcome back, {username}!
            </h2>
            <p className="text-sm sm:text-md text-gray-500">
              {isVendor
                ? `Managing ${storeDisplayName}`
                : "Here’s what’s happening today."}
            </p>
          </div>
        </div>

        {/* <div className="flex gap-3">
          <Button onClick={() => navigate("/profile")} variant="outline">
            Edit Profile
          </Button>
        </div> */}
      </section>

      {/* Leaderboard Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">Market Insights</h3>
        </div>
        <div className="w-full">
          <Leaderboard
            title="Top Performers"
            fetchUrl={PRODUCTS_FETCH_URL}
            streamUrl={PRODUCTS_STREAM_URL}
            pageSize={5}
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;