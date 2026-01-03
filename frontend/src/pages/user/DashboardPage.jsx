import React from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "../../components/ui";
import Leaderboard from "../../components/Leaderboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto w-full space-y-8 mb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Welcome back, {username}!</h2>
            <p className="text-sm sm:text-md text-gray-500">Here’s what’s happening today.</p>
          </div>
        </div>

        <div className="flex gap-0.5 sm:gap-3 scale-80 sm:scale-0">
          <Button onClick={() => navigate("/profile")} variant="outline">
            Edit Profile
          </Button>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">Top Performers</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <Leaderboard />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
