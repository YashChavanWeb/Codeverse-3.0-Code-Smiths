import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Check if GEMINI_API_KEY is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing! Add it to your .env in backend root.");
  process.exit(1);
} else {
  console.log("✅ GEMINI_API_KEY found:", process.env.GEMINI_API_KEY); // Only for development
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseVoiceInput = async (req, res) => {
  try {
    console.log("VOICE PARSE HIT");
    console.log("BODY:", req.body);
    console.log("USER:", req.user?._id);

    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    // ==============================
    // 🧠 Gemini Prompt
    // ==============================
    const prompt = `
You are an intelligent product parser for a grocery marketplace.

User may speak in English, Hindi, or Marathi.
They may NOT say exact words like "price", "quantity", or "unit".

Your task:
- Understand the meaning of the sentence
- Extract product details
- Translate everything to ENGLISH

Rules:
- Product name must be in ENGLISH
- Category must be either "Vegetable" or "Fruit"
- Price is usually a number related to money
- Stock is quantity count
- Unit can be inferred (kg, piece, bunch, dozen, box)

Return ONLY valid JSON. No explanation, no markdown.

JSON format:
{
  "name": string,
  "category": "Vegetable" | "Fruit",
  "price": number,
  "stock": number,
  "unit": "kg" | "piece" | "bunch" | "dozen" | "box"
}

User language: ${language}
User speech: "${transcript}"
`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);

    const rawText = result.response.text();
    console.log("Gemini Raw Response:", rawText);

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Gemini returned invalid JSON:", rawText);
      return res.status(500).json({
        success: false,
        message: "Unable to understand voice input",
      });
    }

    // Send response
    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error("Voice parse error:", error);
    res.status(500).json({ success: false, message: "Voice parsing failed" });
  }
};
