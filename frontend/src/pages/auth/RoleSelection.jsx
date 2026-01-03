import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, Button } from "../../components/ui";

const RoleSelection = () => {
  const navigate = useNavigate();

  const selectRole = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/signup"); // go to signup with role
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <h1 className="text-2xl font-bold">Continue as</h1>
          <p className="text-sm text-foreground-muted">
            Select how you want to use the platform
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" onClick={() => selectRole("user")}>User</Button>
          <Button size="lg" variant="outline" onClick={() => selectRole("vendor")}>Vendor</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
