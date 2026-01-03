import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
} from "../../components/ui";

const VendorCsvUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file before submitting");
      return;
    }

    console.log("CSV file submitted:", file);

    // later: send file to backend using FormData

    navigate("/vendor/add");
  };

  return (
    <div className="min-h-screen bg-background-alt flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Upload CSV</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Upload a CSV file to add multiple items at once
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* File input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {file && (
                  <p className="text-sm text-foreground-muted mt-1">
                    Selected file: {file.name}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-error mt-1">{error}</p>
                )}
              </div>

              {/* CSV format hint */}
              <div className="text-sm text-foreground-muted bg-secondary rounded-md p-3">
                <p className="font-medium mb-1">Expected CSV format:</p>
                <p>category, name, price, quantity, available</p>
                <p className="mt-1">
                  Example: vegetable, Tomato, 40, 10, true
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/vendor/add")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full">
                  Upload CSV
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorCsvUpload;
