import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Home as HomeIcon,
  User,
  LogOut,
  Trophy,
  MapPin,
  ShoppingCart,
  DollarSign,
  PlusSquare,
  Tag,
  BarChart2,
  Mic,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Drawer = ({ open, onToggle, role = "vendor" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // 1. Handle Screen Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Prevent scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobile && open ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // 3. Navigation Configuration
  const menuConfig = {
    user: [
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/" },
      { label: "Leaderboard", icon: <Trophy size={20} />, path: "/leaderboard" },
      { label: "Location Vendors", icon: <MapPin size={20} />, path: "/location-vendors" },
      { label: "Product Comparison", icon: <ShoppingCart size={20} />, path: "/product-comparison" },
      { label: "Basket Estimator", icon: <DollarSign size={20} />, path: "/basket-estimator" },
    ],
    vendor: [
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/vendor" },
      { label: "Add Products", icon: <PlusSquare size={20} />, path: "/vendor/add" },
      { label: "Manage Products", icon: <Tag size={20} />, path: "/vendor/products" },
      { label: "Market Insights", icon: <BarChart2 size={20} />, path: "/vendor/compare" },
      { label: "Voice Updates", icon: <Mic size={20} />, path: "/vendor/add/voice" },
    ],
  };

  const navItems = menuConfig[role] || menuConfig.user;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Main Sidebar/Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-xl flex flex-col transition-all duration-300 z-50
          ${isMobile
            ? `w-64 transform ${open ? "translate-x-0" : "-translate-x-full"}`
            : `${open ? "w-64" : "w-20"}`
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b min-h-[65px]">
          {(open || isMobile) && (
            <h1 className="font-bold text-lg text-green-600 truncate">SmartVegis</h1>
          )}
          <button
            onClick={() => onToggle(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobile && open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Body */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onToggle(false);
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all group
                  ${isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={`${isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                {(open || isMobile) && (
                  <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Profile & Logout */}
        <div className="p-3 border-t space-y-1">
          <button
            onClick={() => {
              navigate("/profile");
              if (isMobile) onToggle(false);
            }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl text-gray-600 hover:bg-gray-50
              ${location.pathname === "/profile" ? "bg-gray-100 text-gray-900" : ""}
            `}
          >
            <User size={20} />
            {(open || isMobile) && <span className="font-medium text-sm">Profile</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {(open || isMobile) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Drawer;