import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, sessionId, language, action } = req.body;

  // Validate required fields
  if (!text || !sessionId || !language || !action) {
    const missingFields = [];
    if (!text) missingFields.push("text");
    if (!sessionId) missingFields.push("sessionId");
    if (!language) missingFields.push("language");
    if (!action) missingFields.push("action");
  
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    let prompt = "";

    if (action === "summarize") {
      // Build the prompt for summarizing the document
      prompt = `
You are a helpful assistant fluent in ${language}. 

Here is a document. Your task is:
1. Provide a clear and concise summary of the document in ${language}.
2. If the document contains actionable items, create a To-Do list based on the content. If no actionable items exist, explicitly state: "No actionable items were found."

Document Content:
${text}
      `;
    } else if (action === "chat") {
      // Build the prompt for follow-up chat messages
      prompt = `
    You are a helpful assistant fluent in ${language}. Answer the following question clearly and concisely in ${language}:
    
    User Question:
    ${text}
      `;
    }
    else {
      return res.status(400).json({ error: "Invalid action specified." });
    }

    // Send the prompt to ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
    });

    const result = response.choices[0]?.message?.content || "No response generated.";

    res.status(200).json({ result });
  } catch (error: any) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).json({ error: "Failed to process request.", details: error.message });
  }
}