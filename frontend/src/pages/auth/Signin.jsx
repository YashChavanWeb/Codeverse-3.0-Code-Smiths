import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

function Signin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signin", formData);

      if (response.status === 200) {
        const { token, role, username } = response.data;

        login({ token, role });
        if (username) localStorage.setItem("username", username);

        // ✅ Redirect based on role
        if (role === "vendor") navigate("/vendor");
        else navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-foreground-muted text-sm">Sign in to access your account</p>
        </CardHeader>
        <CardContent>
          <ErrorBanner message={error} onClose={() => setError("")} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input label="Email Address" type="email" id="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
            <Input label="Password" type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            <Button type="submit" size="lg" className="w-full mt-2">Sign in</Button>
          </form>
          <p className="mt-6 text-center text-foreground-muted text-sm border-t pt-6 border-border">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signin;
