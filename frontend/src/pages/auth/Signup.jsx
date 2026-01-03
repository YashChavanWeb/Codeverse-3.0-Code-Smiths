import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardContent, Button, Input, ErrorBanner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleRoleChange = (e) => setFormData({ ...formData, role: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/auth/signup", formData);

      if (response.status === 201) {
        const { token, role } = response.data;

        // Save in context
        login({ token, role });

        // Save username
        localStorage.setItem("username", formData.username);

        // ✅ Redirect based on role
        if (role === "vendor") navigate("/vendor");
        else navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-alt">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-foreground-muted text-sm">Sign up to get started</p>
        </CardHeader>
        <CardContent>
          <ErrorBanner message={error} onClose={() => setError("")} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input label="Username" type="text" id="username" placeholder="johndoe" value={formData.username} onChange={handleChange} />
            <Input label="Email" type="email" id="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
            <Input label="Password" type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold mb-1">Select Role</label>
              <select id="role" value={formData.role} onChange={handleRoleChange} className="border border-border rounded px-3 py-2 text-foreground">
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <Button type="submit" size="lg" className="w-full mt-4">Sign up</Button>
          </form>
          <p className="mt-6 text-center text-foreground-muted text-sm border-t pt-6 border-border">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;
