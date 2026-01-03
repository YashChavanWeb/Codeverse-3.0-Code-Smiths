import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import Profile from "./components/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* Protected Route */}
        <Route
          path="/profile"
          element={
            localStorage.getItem("token") ? (
              <Profile />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
