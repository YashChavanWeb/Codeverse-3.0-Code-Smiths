import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Context & Routes
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { BasketProvider } from "./context/BasketContext";

// Components
import Drawer from "./components/ui/Drawer";
import Navbar from "./components/ui/Navbar";
import NotificationPanel from "./components/NotificationPanel";

// Auth & Public Pages
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import RoleSelection from "./pages/auth/RoleSelection";

// User Pages
import Dashboard from "./pages/user/DashboardPage";
import BasketEstimator from "./pages/user/BasketEstimator";
import LiveMap from "./components/LiveMap";
import Profile from "./components/Profile";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";

// Simple Navbar
const AppNavbar = ({ drawerOpen }) => {
  const { user } = useAuth();
  return (
    <header
      className={`fixed top-0 left-0 right-0 h-18 bg-green-900 text-white flex items-center px-4 transition-all duration-300 z-20 ${
        drawerOpen ? "md:ml-64" : "md:ml-20"
      }`}
    >
      <h1 className="flex-1 text-xl font-semibold truncate">SmartVegie</h1>
      {user?.name && <span className="text-sm ml-4">{user.name}</span>}
    </header>
  );
};

const AppContent = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/", "/signin", "/signup", "/select-role"];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showDrawer = isAuthenticated && !isPublicRoute;

  const getRedirectPath = () => {
    const role = user?.role || localStorage.getItem("role");
    return role === "vendor" ? "/vendor" : "/dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showDrawer && <Drawer open={drawerOpen} onToggle={setDrawerOpen} />}

      <div className="flex-1 flex flex-col">
        {isAuthenticated && !isPublicRoute && <AppNavbar drawerOpen={drawerOpen} />}

        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            showDrawer ? (drawerOpen ? "md:ml-64 pt-14" : "md:ml-20 pt-14") : "pt-14"
          }`}
        >
          <Routes>
            {/* Public Routes */}
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
                isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Signin />
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/select-role" element={<RoleSelection />} />

            {/* User Protected Routes */}
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
                  <LiveMap />
                </ProtectedRoute>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute roles={["user", "vendor"]}>
                  <NotificationPanel />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
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

export default App;
