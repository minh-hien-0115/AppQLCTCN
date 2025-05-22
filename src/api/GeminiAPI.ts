const GEMINI_API_KEY = "AIzaSyDCz0V7dBQy6BfUb3I_sBtIz0IB_kItPxY"

interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiContentPart[];
}

interface GeminiRequestBody {
  contents: GeminiContent[];
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: GeminiContentPart[];
    };
  }[];
}

export const chatWithGemini = async (
  userMessage: string
): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body: GeminiRequestBody = {
    contents: [
      {
        parts: [{ text: userMessage }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GeminiResponse = await response.json();

    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Bot không trả lời được.";

    return reply;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Có lỗi xảy ra khi gọi API.";
  }
}; 