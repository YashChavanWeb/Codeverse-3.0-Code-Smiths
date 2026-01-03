import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, User, LogOut, Menu, Trophy } from "lucide-react";

// UI Components
import { Card, CardContent, Button } from "./ui";
import Drawer from "./ui/Drawer";
import Leaderboard from "./Leaderboard";
import SimpleMap from "./LiveMap";

const Home = () => {
  const navigate = useNavigate();
  
  // State & Auth Data
  const [drawerOpen, setDrawerOpen] = useState(true);
  const username = localStorage.getItem("username") || "Guest";
  const role = localStorage.getItem("role") || "user";

  const handleLogout = () => {
    localStorage.clear(); // Clears token, username, and role at once
    navigate("/signin");
  };

  const navItems = [
    { icon: <HomeIcon size={20} />, label: "Dashboard", onClick: () => navigate("/") },
    { icon: <User size={20} />, label: "Profile", onClick: () => navigate("/profile") },
    { icon: <Trophy size={20} />, label: "Leaderboard", onClick: () => {} }, // Placeholder
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar / Drawer */}
      <Drawer open={drawerOpen} onToggle={setDrawerOpen} role={role}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={`font-bold text-lg text-green-600 transition-opacity ${!drawerOpen && "opacity-0 invisible"}`}>
              SmartVegis
            </h1>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, idx) => (
              <NavItem
                key={idx}
                icon={item.icon}
                label={item.label}
                open={drawerOpen}
                onClick={item.onClick}
              />
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              {drawerOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </Drawer>

      {/* 2. Main Content Area */}
      <main
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: drawerOpen ? "256px" : "80px" }}
      >
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
      </main>
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