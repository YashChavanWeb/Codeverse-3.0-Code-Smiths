import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  User,
  LogOut,
  MapPin,
  DollarSign,
  PlusSquare,
  Tag,
  BarChart2,
  Mic,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

const Drawer = ({ open, onToggle, role: propRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { logout, role: authRole, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  /* ---------------- Responsive Handling ---------------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- Hide on public routes ---------------- */
  const publicRoutes = ["/signin", "/signup", "/select-role"];
  if (publicRoutes.includes(location.pathname) || !isAuthenticated) return null;

  /* ---------------- Lock scroll (desktop) ---------------- */
  useEffect(() => {
    document.body.style.overflow =
      !isMobile && open ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [open, isMobile]);

  const role = propRole || authRole || "user";

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  /* ---------------- Menu Config ---------------- */
  const menuConfig = {
    user: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Location Vendors", icon: MapPin, path: "/location-vendors" },
      { label: "Basket Estimator", icon: DollarSign, path: "/basket-estimator" },
      {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
        showBadge: true,
      },
    ],
    vendor: [
      { label: "Dashboard", icon: Home, path: "/vendor" },
      { label: "Add Products", icon: PlusSquare, path: "/vendor/add" },
      { label: "Manage Products", icon: Tag, path: "/vendor/products" },
      { label: "Market Insights", icon: BarChart2, path: "/vendor/compare" },
      { label: "Voice Updates", icon: Mic, path: "/vendor/add/voice" },
      {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
        showBadge: true,
      },
    ],
  };

  const navItems = menuConfig[role] || menuConfig.user;

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white border-r shadow-xl flex-col z-50
        transition-all duration-300 ${open ? "w-64" : "w-20"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          {open && (
            <h1 className="font-bold text-lg text-green-600 truncate">
              SmartVegis
            </h1>
          )}
          <button
            onClick={() => onToggle(!open)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition
                  ${
                    active
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className="relative">
                  <Icon size={22} />

                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full min-w-[18px] px-1.5 text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {open && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-1">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            <User size={22} />
            {open && <span className="text-sm font-medium">Profile</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50"
          >
            <LogOut size={22} />
            {open && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ================= Mobile Bottom Navigation ================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow z-50 flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-4 flex flex-col items-center justify-center relative
                ${active ? "text-green-600" : "text-gray-500"}`}
            >
              <Icon size={22} />

              {item.showBadge && unreadCount > 0 && (
                <span className="absolute top-2 right-[35%] bg-red-600 text-white text-xs rounded-full min-w-[16px] px-1 text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Drawer;
