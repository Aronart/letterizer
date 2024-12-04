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
You are a helpful assistant fluent in ${language}. Your job is to thoroughly analyze the following document and provide a complete response in ${language}. Strict Rules:
1. chars inside == are fixed parts of the response: if =....= --> Response has .... in this section;
2. Parts inside [] are for you to think and add your words.
3. Parts inside <> translate to ${language};
4. Be Presice and short.

Your task has the following steps:


Output your response in the following structured format in ${language}:

<1.  Detailed Summary:>
==========================================================================================================================================
   [Provide a detailed and comprehensive but short summary of the document's content in ${language}. The summary should include:  
   - The purpose of the document.  
   - Key points or details (e.g., dates, amounts, deadlines, and instructions).  
   - Any contextual information necessary to fully understand the document.  ]
==========================================================================================================================================
<2. To-Do List:>
==========================================================================================================================================
[If the document contains specific tasks, responsibilities, or actions for the recipient, create a detailed and organized To-Do list. If the document contains no actionable items, explicitly state:  
"No actionable items were found."]
<1. [Actionable item 1, with details and deadline if applicable]>
=_________________________________________________________________________________________________________________________________________=
<2. [Actionable item 2, with details and deadline if applicable]>
=_________________________________________________________________________________________________________________________________________=
...
[If the document contains specific tasks, responsibilities, or actions for the recipient, create a detailed and organized To-Do list. If the document contains no actionable items, explicitly state:  
"No actionable items were found."]
==========================================================================================================================================
<3. Notes or Clarifications:>
==========================================================================================================================================
[Provide explanations for confusing sections, additional context, or optional information if needed.]



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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("OpenAI API Error:", error.message);
      res.status(500).json({ error: "Failed to process request.", details: error.message });
    } else {
      console.error("OpenAI API Error: Unknown error occurred.");
      res.status(500).json({ error: "Failed to process request.", details: "Unknown error occurred." });
    }
  }
}