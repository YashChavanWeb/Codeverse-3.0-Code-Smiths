import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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

// User Pages
import BasketEstimator from "./pages/BasketEstimator";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorAddOptions from "./pages/vendor/VendorAddOptions";
import VendorManualAdd from "./pages/vendor/VendorManualAdd";
import VendorCsvUpload from "./pages/vendor/VendorCsvUpload";
import VendorVoiceAdd from "./pages/vendor/VendorVoiceAdd";
import VendorProducts from "./pages/vendor/VendorProducts";
import LiveMap from "./components/LiveMap";
import Dashboard from "./pages/user/DashboardPage";

const AppContent = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public routes where we don't want the drawer or the sidebar margin
  const publicRoutes = ["/signin", "/signup", "/select-role"];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showDrawer = isAuthenticated && !isPublicRoute;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showDrawer && <Drawer open={drawerOpen} onToggle={setDrawerOpen} />}

      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${showDrawer ? (drawerOpen ? "md:ml-64" : "md:ml-20") : ""
          }`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />

          {/* Root Route with Logic for Unauthenticated Users */}
          <Route
            path="/"
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
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;