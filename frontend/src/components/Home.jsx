import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "./ui";
import { Drawer } from "../components/ui/Drawer";
import { Menu } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";
  const role = localStorage.getItem("role") || "vendor"; // customer / vendor
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/signin");
  };

  return (
    <div className="flex min-h-screen bg-background-alt">
      {/* Drawer toggle button - only on desktop when drawer is closed */}
      {!drawerOpen && (
        <button
          className="absolute top-4 left-4 p-2 rounded-lg bg-white shadow-md z-50 hover:bg-gray-100 hidden md:flex"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}


      {/* Drawer Component */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} role={role} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card variant="glass" className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">{username.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back</h1>
            <p className="text-foreground-muted mb-8 italic">
              Hello, <span className="font-semibold text-foreground">{username}</span> 👋
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/profile")}
                variant="primary"
                className="w-full"
              >
                View Profile
              </Button>
              <Button onClick={handleLogout} variant="secondary" className="w-full">
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Home;
