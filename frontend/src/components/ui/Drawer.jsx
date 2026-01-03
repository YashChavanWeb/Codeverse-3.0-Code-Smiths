import React from "react";
import { useNavigate } from "react-router-dom";
import {
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

export const Drawer = React.forwardRef(
  ({ open, onClose, role = "customer", width = "280px" }, ref) => {
    const navigate = useNavigate();

    React.useEffect(() => {
      document.body.style.overflow = open ? "hidden" : "unset";
      return () => (document.body.style.overflow = "unset");
    }, [open]);

    // Route mapping for navigation
    const getRouteForOption = (label) => {
      const routeMap = {
        "Leaderboard": "/leaderboard",
        "Location Vendors": "/location-vendors",
        "Product Comparison": "/product-comparison",
        "Basket Estimator": "/basket-estimator",
        "Add Products": "/vendor/add", // Goes to VendorAddOptions
        "Change Price / Update": "/vendor/products", // Goes to product listing where they can update
        "Compare Neighbor Prices": "/vendor/compare", // You might need to create this route
        "Voice Updates": "/vendor/add/voice", // Goes to VendorVoiceAdd
      };
      return routeMap[label] || "#";
    };

    // Handle option click
    const handleOptionClick = (label) => {
      const route = getRouteForOption(label);
      if (route !== "#") {
        navigate(route);
        onClose(); // Close drawer after navigation
      }
    };

    // All options
    const options = [
      { label: "Leaderboard", icon: <Trophy size={18} /> },
      { label: "Location Vendors", icon: <MapPin size={18} /> },
      { label: "Product Comparison", icon: <ShoppingCart size={18} /> },
      { label: "Basket Estimator", icon: <DollarSign size={18} /> },
      { label: "Add Products", icon: <PlusSquare size={18} /> },
      { label: "Change Price / Update", icon: <Tag size={18} /> },
      { label: "Compare Neighbor Prices", icon: <BarChart2 size={18} /> },
      { label: "Voice Updates", icon: <Mic size={18} /> },
    ];

    // Filter options based on role
    const visibleOptions =
      role === "customer" ? options.slice(0, 4) : options.slice(4, 8);

    return (
      <>
        {/* Desktop Sidebar */}
        <div
          ref={ref}
          className={`hidden md:flex fixed top-0 left-0 h-full bg-white shadow-xl transform transition-transform z-40 ${open ? "translate-x-0" : "-translate-x-full"
            }`}
          style={{ width }}
        >
          {/* Sidebar Content */}
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg text-green-600">SmartVegis</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-2">
              {visibleOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt.label)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-green-50 text-gray-700 font-medium transition-colors"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Bottom Menu */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-t flex justify-around border-t z-50">
          {visibleOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleOptionClick(opt.label)}
              className="flex flex-col items-center justify-center py-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              {opt.icon}
              <span className="text-xs mt-1">{opt.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Mobile overlay when drawer is open */}
        <div
          className={`md:hidden fixed inset-0 bg-black/40 transition-opacity ${open ? "opacity-100 block" : "opacity-0 hidden"
            }`}
          onClick={onClose}
        />
      </>
    );
  }
);

Drawer.displayName = "Drawer";