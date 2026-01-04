import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Context & Routes
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Components
import Drawer from "./components/ui/Drawer";

// Auth & Public Pages
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import RoleSelection from "./pages/auth/RoleSelection";

// General Pages
import Profile from "./components/Profile";
import NotificationsPage from "./pages/user/NotificationPage";

// User Pages
import Dashboard from "./pages/user/DashboardPage";
import BasketEstimator from "./pages/user/BasketEstimator";
import LocationLiveMap from "./pages/user/LocationLiveMap";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";

import { BasketProvider } from "./context/BasketContext";

import logo from './assets/Images/logo.png';

const Navbar = ({ drawerOpen }) => {
  const { user } = useAuth();

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-18 bg-green-900 text-white flex items-center px-4 transition-all duration-300 z-20 ${
        drawerOpen ? "md:ml-64" : "md:ml-20"
      }`}
    >
      <img src={logo} className="w-15 h-15" alt="logo" />
      <h1 className="flex-1 text-xl font-semibold truncate text-white">SmartVegie</h1>
      <div className="ml-4">
        {user?.name && <span className="text-sm">{user.name}</span>}
      </div>
    </header>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Drawer state with localStorage persistence
  const [drawerOpen, setDrawerOpen] = useState(() => {
    const saved = localStorage.getItem("drawerOpen");
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDrawer = () => {
    setDrawerOpen((prev) => {
      const next = !prev;
      localStorage.setItem("drawerOpen", JSON.stringify(next));
      return next;
    });
  };

  const publicRoutes = ["/", "/signin", "/signup", "/select-role"];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showDrawer = isAuthenticated && !isPublicRoute;

  const getRedirectPath = () => {
    const role = user?.role || localStorage.getItem("role");
    return role === "vendor" ? "/vendor" : "/dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Drawer */}
      {showDrawer && <Drawer open={drawerOpen} onToggle={toggleDrawer} />}

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        {isAuthenticated && !isPublicRoute && <Navbar drawerOpen={drawerOpen} />}

      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${showDrawer ? (drawerOpen ? "md:ml-64" : "md:ml-20") : ""
          }`}
      >
        {/* Add padding-top for mobile header */}
        <div className={isAuthenticated ? "md:pt-0 pt-24" : ""}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to={getRedirectPath()} replace />
                ) : (
                  <LandingPage />
                )
              }
            />

            <Route
              path="/signin"
              element={
                isAuthenticated ? (
                  <Navigate to={getRedirectPath()} replace />
                ) : (
                  <Signin />
                )
              }
            />

            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/signup" element={<Signup />} />

            {/* Common Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["user", "vendor"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/notifications"
              element={
                <ProtectedRoute roles={["user", "vendor"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["user"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
                  <LocationLiveMap />
                </ProtectedRoute>
              }
            />

            {/* Vendor Routes */}
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BasketProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BasketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;