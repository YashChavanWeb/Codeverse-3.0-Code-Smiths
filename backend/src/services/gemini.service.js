import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseVoiceInput = async (req, res) => {
  try {
    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    const prompt = `
You are a JSON API.

Return ONLY raw JSON.
No explanation. No markdown.

Extract product details and translate to ENGLISH.

JSON format:
{
  "name": string,
  "category": "Vegetable" | "Fruit",
  "price": number,
  "stock": number,
  "unit": "kg" | "piece" | "bunch" | "dozen" | "box"
}

User language: ${language}
Speech:
"${transcript}"
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Invalid Gemini output:", rawText);
      return res.status(500).json({
        success: false,
        message: "Unable to understand voice input",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.status(200).json({
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
