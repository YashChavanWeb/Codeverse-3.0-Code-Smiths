import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import Profile from "./components/Profile";

// Utility function for protected routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
};

// Vendor pages
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";

const App = () => {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* Protected Profiles */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* Vendor Routes */}
        <Route
          path="/vendor/add"
          element={
            isAuthenticated ? (
              <VendorAddOptions />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route
          path="/vendor/add/manual"
          element={
            isAuthenticated ? (
              <VendorManualAdd />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route
          path="/vendor/add/csv"
          element={
            isAuthenticated ? (
              <VendorCsvUpload />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route
          path="/vendor/add/voice"
          element={
            isAuthenticated ? (
              <VendorVoiceAdd />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* ✅ NEW: Vendor Product Listing Page */}
        <Route
          path="/vendor/products"
          element={
            isAuthenticated ? (
              <VendorProducts />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;