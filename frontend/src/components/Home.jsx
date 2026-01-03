import React from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "./ui";
import Leaderboard from "./Leaderboard";

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {username}!</h2>
            <p className="text-gray-500">Here’s what’s happening today.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate("/profile")} variant="outline">
            Edit Profile
          </Button>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">Top Performers</h3>
        </div>
        <Leaderboard />
      </section>
    </div>
  );
};

// Helper Sub-component
const NavItem = ({ icon, label, open, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-green-50 text-gray-700 transition-all group"
    title={!open ? label : ""}
  >
    <span className="text-gray-500 group-hover:text-green-600">{icon}</span>
    {open && <span className="font-medium">{label}</span>}
  </button>
);

export default Home;