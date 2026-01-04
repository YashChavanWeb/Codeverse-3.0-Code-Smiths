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