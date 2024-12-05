import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, sessionId, language, action } = req.body;

  console.log("Incoming Parameters:", { text, sessionId, language, action });

  if (!text || !sessionId || !language || !action) {
    const missingFields = [];
    if (!text) missingFields.push("text");
    if (!sessionId) missingFields.push("sessionId");
    if (!language) missingFields.push("language");
    if (!action) missingFields.push("action");

    console.error("Missing fields:", missingFields);

    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    let prompt = "";

    if (action === "summarize") {
      prompt = `You are a helpful assistant fluent in ${language}. Your job is to analyze the following document and provide an **easy-to-understand** response for someone unfamiliar with complex language or bureaucratic terms. Imagine the person is an expat trying to quickly figure out what they need to do.

Follow these strict rules:

1. **Fixed Responses**: Text inside __ is fixed and must be included exactly as written (e.g., _..._ means the response must contain _..._).
2. **Simple Words**: Avoid long or complex sentences. Use short, clear sentences that are easy to read. No technical jargon or unnecessary details.
3. **Direct and Actionable**: Focus on what the person needs to know and what actions they need to take.
4. **Translations**: Text inside <> must be translated into ${language}.

Your response must follow this format in ${language}:

---

1. What is this document about?
__________________________________________________________________________________________________________________________________________
[Write a simple explanation of the documents purpose in ${language}. Focus on the "big picture" in 2–3 short sentences.]
__________________________________________________________________________________________________________________________________________

2. What do I need to do?
__________________________________________________________________________________________________________________________________________
[Create a clear and simple To-Do List in ${language}. Focus on actions the person needs to take, written as clear steps. Start with 2.1. Before each ToDo Step (2.1.; 2.2.) also add: __________________________________________________________________________________________________________________________________________ . If there is nothing to do, state: _There is nothing you need to do_.]
2.1. [Actionable step 1 with details (e.g., deadlines, amounts, or where to send something).] 

2.2. [Actionable step 2, if applicable.] 

2.3. [Actionable step 3, if applicable.] 
...
__________________________________________________________________________________________________________________________________________

3. Important Notes or Warnings
__________________________________________________________________________________________________________________________________________
[Add any important information the person should know, such as deadlines, legal warnings, or helpful tips.  
If there is nothing important, state: =There is nothing extra you need to know.]
__________________________________________________________________________________________________________________________________________

---

**Tone Guidelines**:
- **Friendly**: Write as if you are calmly explaining something to a friend.
- **Encouraging**: If the document sounds overwhelming, reassure them it is manageable and provide guidance.
- **Focused**: Highlight only the key points; ignore unnecessary details.

Document Text:\n\n
${text}`;
    } else if (action === "chat") {
      prompt = `You are a helpful assistant fluent in ${language}. Respond to the user's query:\n\n${text}`;
    } else {
      return res.status(400).json({ error: "Invalid action specified." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`${content}`); // Send raw content without "data:" prefix
      }
    }

    console.log("Final Response:", fullResponse);

    res.end();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("OpenAI API Error:", error.message);
      res.status(500).json({ error: "Failed to process request.", details: error.message });
    } else {
      console.error("Unknown OpenAI API Error.");
      res.status(500).json({ error: "Unknown error occurred." });
    }
  }
}