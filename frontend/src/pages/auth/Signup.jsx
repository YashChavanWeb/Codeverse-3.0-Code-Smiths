import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { MapPin, Loader2 } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: localStorage.getItem("selectedRole") || "user",
    storeName: "",
    // Updated to match the new Mongoose schema structure
    location: {
      address: "",
      coordinates: ""
    },
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Handle nested location address update
    if (id === "location") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, address: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `${latitude}, ${longitude}`;

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );

          const fullAddress = response.data?.display_name || "Address found via GPS";

          setFormData((prev) => ({
            ...prev,
            location: {
              address: fullAddress,
              coordinates: coordsString
            }
          }));
        } catch (err) {
          console.error("Geocoding error:", err);
          // Fallback: use coordinates for address if API fails
          setFormData((prev) => ({
            ...prev,
            location: {
              address: coordsString,
              coordinates: coordsString
            }
          }));
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setError("Location access denied. Please type your address manually.");
        setIsDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.role === "vendor") {
      if (!formData.storeName || !formData.location.address) {
        setError("Vendor accounts require a Store Name and Address.");
        return;
      }
      // If coordinates are missing (manual typing), we set a default or prompt
      if (!formData.location.coordinates) {
        // Option: set to "manual" or keep empty string
        formData.location.coordinates = "manual_entry";
      }
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signup", formData);

      if (response.status === 201) {
        const { token, role, username } = response.data;
        login({ token, role, username: username || formData.username });
        role === "vendor" ? navigate("/vendor") : navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Create Account</h1>
          <p className="text-foreground-muted text-sm capitalize">
            Joining as a <span className="text-primary font-semibold">{formData.role}</span>
          </p>
        </CardHeader>

        <CardContent>
          <ErrorBanner message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input
              label="Username"
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              label="Email Address"
              type="email"
              id="email"
              placeholder="you@example.com"
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

            {formData.role === "vendor" && (
              <div className="space-y-4 pt-2 border-t border-dashed border-border mt-2">
                <Input
                  label="Store Name"
                  id="storeName"
                  placeholder="e.g. Fresh Garden Veggies"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />

                <div className="relative">
                  <Input
                    label="Store Address"
                    id="location" // id maps to logic in handleChange
                    placeholder="Enter physical address"
                    value={formData.location.address}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="absolute right-2 top-[32px] p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.location.coordinates && formData.location.coordinates !== "manual_entry" && (
                  <p className="text-[10px] text-green-600 font-medium">
                    ✓ GPS Coordinates captured
                  </p>
                )}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Processing..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm space-y-3">
            <p className="text-foreground-muted">
              Already have an account? <Link to="/signin" className="text-primary hover:underline font-bold">Sign in</Link>
            </p>
            <p className="text-xs">
              Wrong role? <Link to="/select-role" className="text-primary hover:underline">Change role</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;