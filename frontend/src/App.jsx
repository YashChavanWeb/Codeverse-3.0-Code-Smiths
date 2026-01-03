import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context & Routes
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import RoleSelection from "./pages/auth/RoleSelection";

// General Pages
import Home from "./components/Home";
import Profile from "./components/Profile";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />

          {/* User Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute roles={["user"]}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["user", "vendor"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Vendor Protected Routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/add"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorAddOptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/add/manual"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorManualAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/add/csv"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorCsvUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/add/voice"
            element={
              <ProtectedRoute roles={["vendor"]}>
                <VendorVoiceAdd />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;