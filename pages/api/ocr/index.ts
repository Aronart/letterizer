import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";
import { supabase } from "@/utils/supabase";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const textract = new AWS.Textract();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { s3Key, sessionId, userId } = req.body;

    console.log("Session ID being sent to the database:", sessionId);

    if (!s3Key || !sessionId) {
      return res.status(400).json({ error: "Missing required fields: s3Key or sessionId" });
    }

    try {
      // Process file with AWS Textract
      const textractResponse = await textract
        .detectDocumentText({
          Document: { S3Object: { Bucket: process.env.AWS_S3_BUCKET || "", Name: s3Key } },
        })
        .promise();

      const extractedText = textractResponse.Blocks?.filter(
        (block) => block.BlockType === "LINE"
      )
        .map((block) => block.Text)
        .join("\n");

      if (!extractedText) {
        return res.status(400).json({ error: "No text detected in the document." });
      }

      console.log("Inserting into database:", {
        session_id: sessionId,
        user_id: userId || null,
        s3_key: s3Key,
        extracted_text: extractedText,
        action: "ocr",
      });

      // Insert OCR result into the database
      const { error } = await supabase.from("sessions").insert([
        {
          session_id: sessionId,
          user_id: userId || null,
          s3_key: s3Key,
          extracted_text: extractedText,
          action: "ocr",
        },
      ]);

      if (error) {
        console.error("Database Insert Error:", error);
        return res.status(500).json({ error: "Failed to save data in the database." });
      }

      res.status(200).json({ extractedText });
    } catch (error: any) {
      console.error("Textract Error:", error);
      res.status(500).json({ error: "Failed to process document.", details: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}