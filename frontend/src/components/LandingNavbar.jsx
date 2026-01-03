import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Images/logo.png"; // adjust path if needed

const LandingNavbar = () => {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-white border-b">
      
      {/* Logo + App Name */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logo}
          alt="SmartVegis Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="text-xl font-bold text-green-600">
          SmartVegis
        </span>
      </Link>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link
          to="/signin"
          className="text-gray-600 hover:text-gray-900 transition"
        >
          Sign In
        </Link>

        <Link
          to="/signup"
          className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;