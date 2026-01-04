import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Home as HomeIcon,
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
  const { logout, role: authRole, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide Drawer on public routes
  const publicRoutes = ["/", "/signin", "/signup", "/select-role"];
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
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/dashboard" },
      { label: "Location Vendors", icon: <MapPin size={20} />, path: "/location-vendors" },
      { label: "Basket Estimator", icon: <DollarSign size={20} />, path: "/basket-estimator" },
      { 
        label: "Notifications", 
        icon: <Bell size={20} />, 
        path: "/notifications",
        badge: unreadCount > 0 ? unreadCount : null
      },
    ],
    vendor: [
      { label: "Dashboard", icon: <HomeIcon size={20} />, path: "/vendor" },
      { label: "Add Products", icon: <PlusSquare size={20} />, path: "/vendor/add" },
      { label: "Manage Products", icon: <Tag size={20} />, path: "/vendor/products" },
      // { label: "Market Insights", icon: <BarChart2 size={20} />, path: "/vendor/compare" },
      // { label: "Voice Updates", icon: <Mic size={20} />, path: "/vendor/add/voice" },
      { 
        label: "Notifications", 
        icon: <Bell size={20} />, 
        path: "/notifications",
        badge: unreadCount > 0 ? unreadCount : null
      },
    ],
  };

  const navItems = menuConfig[role] || menuConfig.user;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-full bg-green-500/20 border-r shadow-xl flex-col transition-all duration-300 z-50
          ${open ? "w-64" : "w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
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
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ease-in-out group relative
                  ${isActive
                    ? "bg-green-500/30 text-green-800 px-3"
                    : "text-gray-500 hover:bg-green-50 hover:text-gray-900"
                  }
                `}
              >
                <div className="relative">
                  <span className={`${isActive ? "text-green-800" : "text-gray-500 group-hover:text-gray-600"}`}>
                    {item.icon}
                  </span>
                  
                  {/* Badge for collapsed sidebar (on icon) */}
                  {!open && item.badge && item.path === "/notifications" && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                
                {open && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>
                    
                    {/* Badge for expanded sidebar (next to label) */}
                    {item.badge && item.path === "/notifications" && (
                      <span className="flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                )}
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

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-b border-b z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-bold text-lg text-green-600">SmartVegis</h1>
          <div className="flex items-center gap-3">
            {/* Mobile Notification Bell with Badge */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell size={22} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <User size={22} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="flex border-t">
          {navItems.slice(0, 4).map((item) => ( // Show only first 4 items on mobile
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-3 flex flex-col items-center justify-center text-gray-600 hover:text-green-600 transition-colors relative
                ${location.pathname === item.path ? "text-green-600" : ""}
              `}
            >
              <div className="relative">
                {item.icon}
                
                {/* Badge for mobile notifications */}
                {item.badge && item.path === "/notifications" && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Drawer;