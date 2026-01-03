import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardContent, Button } from "../../components/ui";


const EXAMPLES = {
  "en-IN": "Example: Tomatoes 40 rupees 30 kilos",
  "hi-IN": "उदाहरण: टमाटर 40 रुपये 30 किलो",
  "mr-IN": "उदाहरण: टोमॅटो 40 रुपये 30 किलो",
};

const VendorVoiceAdd = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState(null);

  /* ============================
     🎙 INIT SPEECH RECOGNITION
     ============================ */
 useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true; // keeps listening until user stops
  recognition.interimResults = false;
  recognition.lang = language;

  recognition.onresult = (event) => {
    // append each new phrase to transcript
    const text = event.results[event.results.length - 1][0].transcript;
    setTranscript((prev) => (prev ? prev + " " + text : text));
  };

  recognition.onerror = (event) => {
    console.error("Speech error:", event.error);
    setError("Voice recognition failed");
  };

  recognition.onend = () => {
    // do not auto-restart; only stop when user clicks Stop
    setListening(false);
  };

  recognitionRef.current = recognition;
}, [language]);


  /* ============================
     ▶ START LISTENING
     ============================ */
  const startListening = () => {
    setTranscript("");
    setParsedData(null);
    setError("");
    setListening(true);
    recognitionRef.current.start();
  };



const stopListening = async () => {
  if (!recognitionRef.current) return;

  recognitionRef.current.stop();
  setListening(false);

  if (!transcript.trim()) {
    setError("No voice detected");
    return;
  }

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/voice/parse`,
      { transcript, language },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    setParsedData(res.data.data); // display parsed data in table
    setError(""); // clear any previous errors
  } catch (err) {
    console.error("Parse error:", err);
    setError("Voice data not recognized properly");
  }
};



  /* ============================
     💾 STORE PRODUCT
     ============================ */
  const handleSubmit = async () => {
    if (!parsedData) {
      setError("Please record and confirm product details first");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products`,
        {
          name: parsedData.name,
          category: parsedData.category,
          price: parsedData.price,
          unit: parsedData.unit,
          stock: parsedData.stock,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Product added successfully!");
      navigate("/vendor/add");
    } catch (err) {
      console.error("Store product error:", err);
      setError("Failed to store product");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="bg-linear-to-br from-green-50/80 via-green-600/20 to green-50/80">
            <h2 className="text-2xl font-semibold">Voice Product Entry</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Speak in English / Hindi / Marathi
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* Language */}
            <div>
              <label className="text-sm font-medium">Select Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-md px-3 py-2 w-full text-sm"
              >
                <option value="en-IN">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="mr-IN">Marathi</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button onClick={startListening} disabled={listening}>
                ▶ Start
              </Button>
              <Button
                variant="secondary"
                onClick={stopListening}
                disabled={!listening}
              >
                ⏹ Stop
              </Button>
            </div>

            {/* Transcript */}
            <div className="border rounded-md p-4 min-h-[100px] bg-white">
              {transcript || <p className="text-sm text-gray-400">{EXAMPLES[language]}</p>}
            </div>

            {/* Parsed Data */}
            {parsedData && (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Stock</th>
                      <th className="px-4 py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-2">{parsedData.name}</td>
                      <td className="px-4 py-2">{parsedData.category}</td>
                      <td className="px-4 py-2">₹{parsedData.price}</td>
                      <td className="px-4 py-2">{parsedData.stock}</td>
                      <td className="px-4 py-2">{parsedData.unit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/vendor/add")}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!parsedData}
              >
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorVoiceAdd;
