import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context & Routes
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Components
import Drawer from "./components/ui/Drawer";

// Auth Pages
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import RoleSelection from "./pages/auth/RoleSelection";

// General Pages
import Profile from "./components/Profile";

//User Pages
import BasketEstimator from "./pages/user/BasketEstimator";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";
import LiveMap from "./components/LiveMap";
import Dashboard from "./pages/user/DashboardPage";
import LocationLiveMap from "./pages/user/LocationLiveMap";

// Landing Page
import LandingPage from "./pages/LandingPage";

const AppContent = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isAuthenticated && <Drawer open={drawerOpen} onToggle={setDrawerOpen} />}

      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isAuthenticated ? (drawerOpen ? "md:ml-64" : "md:ml-20") : ""
        }`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Leaderboard /> : <LandingPage />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />

          {/* Root Route with Logic for Unauthenticated Users */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <ProtectedRoute roles={["user"]}>
                  <Dashboard />
                </ProtectedRoute>
              ) : (
                <Navigate to="/select-role" replace />
              )
            }
          />

          {/* User Protected Routes */}
          <Route
            path="/basket-estimator"
            element={
              <ProtectedRoute roles={["user"]}>
                <BasketEstimator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location-vendors"
            element={
              <ProtectedRoute roles={["user"]}>
                <LiveMap />
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute roles={["user"]}>
                <Leaderboard />
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
            path="/location-vendors"
            element={
              <ProtectedRoute roles={["user"]}>
                <LocationLiveMap />
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

          {/* Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["user", "vendor"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
