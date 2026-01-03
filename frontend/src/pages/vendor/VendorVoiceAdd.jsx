import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import your auth hook
import {
  Card,
  CardHeader,
  CardContent,
  Button,
} from "../../components/ui";

const VendorVoiceAdd = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token for the header
  const recognitionRef = useRef(null);

  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    setError("");
    setParsedData(null);
    setTranscript("");

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = () => {
      setError("Error while capturing voice");
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

    setListening(true);
    setPaused(false);
  };

  const pauseListening = () => {
    recognitionRef.current?.stop();
    setPaused(true);
    setListening(false);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setPaused(false);
    parseTranscript();
  };

  const parseTranscript = () => {
    if (!transcript) return;

    const text = transcript.toLowerCase();

    // Basic regex to pull data from phrases like "Tomato price 40 quantity 10"
    const nameMatch = text.match(/^[a-z]+/i);
    const priceMatch = text.match(/(?:price|rate)\s*(\d+)/i);
    const quantityMatch = text.match(/(?:quantity|stock|qty)\s*(\d+)/i);

    const name = nameMatch ? nameMatch[0] : "";

    setParsedData({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      price: priceMatch ? priceMatch[1] : "",
      quantity: quantityMatch ? quantityMatch[1] : "",
      category: "Vegetable", // Default fallback
      unit: "kg",            // Default fallback
    });
  };

  const handleSubmit = async () => {
    if (!parsedData || !parsedData.name || !parsedData.price) {
      setError("Please ensure name and price were captured clearly");
      return;
    }

    setLoading(true);
    try {
      // Mapping parsed voice data to backend schema
      const payload = {
        name: parsedData.name,
        category: parsedData.category,
        price: Number(parsedData.price),
        unit: parsedData.unit,
        stock: Number(parsedData.quantity) || 0,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.data) {
        alert("Product added successfully!");
        navigate("/vendor/add");
      }
    } catch (err) {
      console.error("Voice submit error:", err);
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-alt flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Voice Input</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Speak product name, price, and quantity
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">

            {/* Language Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Select Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="en-IN">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="mr-IN">Marathi</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button onClick={startListening} disabled={listening || loading}>
                ▶ Start
              </Button>
              <Button
                variant="secondary"
                onClick={pauseListening}
                disabled={!listening || loading}
              >
                | | Pause
              </Button>
              <Button
                variant="secondary"
                onClick={stopListening}
                disabled={(!listening && !paused) || loading}
              >
                ■ Stop
              </Button>
            </div>

            {/* Transcript */}
            <div className="border border-border rounded-md p-4 min-h-[100px] bg-white">
              {transcript ? (
                <p className="text-sm">{transcript}</p>
              ) : (
                <p className="text-sm text-foreground-muted">
                  Example: Tomato price 40 quantity 10
                </p>
              )}
            </div>

            {/* Parsed Table */}
            {parsedData && (
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left px-4 py-2">Product</th>
                      <th className="text-left px-4 py-2">Price (₹)</th>
                      <th className="text-left px-4 py-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-2">
                        {parsedData.name || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {parsedData.price || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {parsedData.quantity || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/vendor/add")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!parsedData || loading}
              >
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorVoiceAdd;