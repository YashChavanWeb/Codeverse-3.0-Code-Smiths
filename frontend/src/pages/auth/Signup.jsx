import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    role: "user" // Default role
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. Authenticated Guard: Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signup", formData);

      if (response.status === 201) {
        const { token, role, username } = response.data;

        // 2. Sync with AuthContext
        login({ token, role, username: username || formData.username });

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
        setError(err.response.data.message || "Registration failed. Try a different email.");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
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
          <h1 className="text-3xl font-bold mb-2 text-foreground">Create Account</h1>
          <p className="text-foreground-muted text-sm">Join SmartVegis today</p>
        </CardHeader>
        
        <CardContent>
          <ErrorBanner message={error} onClose={() => setError("")} />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input 
              label="Username" 
              type="text" 
              id="username" 
              placeholder="johndoe" 
              value={formData.username} 
              onChange={handleChange} 
              required
            />
            <Input 
              label="Email Address" 
              type="email" 
              id="email" 
              placeholder="name@company.com" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
            <Input 
              label="Password" 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required
            />

            {/* Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-semibold text-gray-700">
                I am a...
              </label>
              <select 
                id="role" 
                value={formData.role} 
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="user">Customer (Looking for veggies)</option>
                <option value="vendor">Vendor (Selling veggies)</option>
              </select>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm border-t pt-6 border-border text-foreground-muted">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;