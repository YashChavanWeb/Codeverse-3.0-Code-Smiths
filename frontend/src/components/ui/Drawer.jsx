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

const Drawer = ({ open, onToggle, role: propRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, role: authRole, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide Drawer on public routes
  const publicRoutes = ["/signin", "/signup", "/select-role"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Prevent scroll when drawer open (desktop only)
  useEffect(() => {
    document.body.style.overflow = !isMobile && open && !isPublicRoute ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open, isMobile, isPublicRoute]);

  if (isPublicRoute || !isAuthenticated) return null;

  const role = propRole || authRole || "user";

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const menuConfig = {
    user: [
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/" },
      { label: "Location Vendors", icon: <MapPin size={20} />, path: "/location-vendors" },
      { label: "Basket Estimator", icon: <DollarSign size={20} />, path: "/basket-estimator" },
    ],
    vendor: [
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/vendor" },
      { label: "Add Products", icon: <PlusSquare size={20} />, path: "/vendor/add" },
      { label: "Manage Products", icon: <Tag size={20} />, path: "/vendor/products" },
      { label: "Market Insights", icon: <BarChart2 size={20} />, path: "/vendor/compare" },
    ],
  };

  const navItems = menuConfig[role] || menuConfig.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white border-r shadow-xl flex-col transition-all duration-300 z-50
          ${open ? "w-64" : "w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          {open && <h1 className="font-bold text-lg text-green-600 truncate">SmartVegis</h1>}
          <button
            onClick={() => onToggle(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all group
                  ${isActive
                    ? "bg-green-100 text-green-700 px-3"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={`${isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>
                {open && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-1">
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 w-full p-4 rounded-xl text-gray-600 hover:bg-gray-50
              ${location.pathname === "/profile" ? "bg-gray-100 text-gray-900" : ""}
            `}
          >
            <User size={20} />
            {open && <span className="font-medium text-sm">Profile</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {open && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-t border-t z-50 flex">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex-1 py-5 flex flex-col items-center justify-center text-gray-600 hover:text-green-600 transition-colors
        ${location.pathname === item.path ? "text-green-600" : ""}
      `}
          >
            {item.icon}
            {/* <span className="text- mt-1 text-center whitespace-normal break-words">{item.label}</span> */}
          </button>
        ))}
      </div>

    </>
  );
};

export default Drawer;
