import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

function Signin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      role === "vendor" ? navigate("/vendor") : navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signin`, formData);

      if (response.status === 200) {
        const { token, role, username } = response.data;

        // 2. Use AuthContext to set global state
        login({ token, role, username });

        // 3. Role-based Redirection
        if (role === "vendor") {
          navigate("/vendor");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      // 4. Detailed Error Handling
      if (err.response) {
        setError(err.response.data.message || "Invalid email or password.");
      } else if (err.request) {
        setError("Unable to connect to server. Please try again later.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome Back</h1>
          <p className="text-foreground-muted text-sm">Sign in to manage your SmartVegis account</p>
        </CardHeader>
        
        <CardContent>
          {/* Error Display */}
          <ErrorBanner message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input
              label="Email Address"
              type="email"
              id="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="text-right">
                <Link to="/forgot-password" size="xs" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-2" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm border-t pt-6 border-border">
            <p className="text-foreground-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-bold">
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signin;