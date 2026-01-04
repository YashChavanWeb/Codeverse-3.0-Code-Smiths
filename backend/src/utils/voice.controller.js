import { GoogleGenerativeAI } from "@google/generative-ai";

export const parseVoiceInput = async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    console.log("VOICE PARSE HIT");
    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    /* ==============================
       🧠 INTENT-AWARE GEMINI PROMPT
       ============================== */
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

Return ONLY valid JSON.
No explanation. No markdown.

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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    console.log("Gemini processed transcript:", rawText);

    let parsed;
    try {
      // Use regex to find the first JSON object in the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Gemini returned invalid JSON:", rawText);
      return res.status(500).json({
        success: false,
        message: "Unable to understand voice input",
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Voice parse error:", error);
    res.status(500).json({
      success: false,
      message: "Voice parsing failed",
    });
  }
};
