import React from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Smarter vegetable shopping, <br />
            <span className="text-green-600">
              powered by local vendors
            </span>
          </h1>

          <p className="text-gray-600 mt-6 text-lg max-w-xl">
            Compare prices, estimate baskets, and find the best nearby vendors —
            all while supporting local businesses.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/signin")}
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 transition"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right Visual (2D, clean) */}
        <div className="hidden md:flex justify-center">
          <div className="w-80 h-80 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-6xl">🥕🥦🍅</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 pb-6">
        © {new Date().getFullYear()} SmartVegis. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;