import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/signin" replace />;

  if (roles && !roles.includes(role)) {
    // Redirect based on role
    if (role === "vendor") return <Navigate to="/vendor" replace />;
    if (role === "user") return <Navigate to="/" replace />;
    return <Navigate to="/select-role" replace />;
  }

  return children;
};

export default ProtectedRoute;
