import { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { filename, fileType } = req.body;

      if (!filename || !fileType) {
        return res.status(400).json({ error: "Filename and fileType are required." });
      }

      // Generate pre-signed URL
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `uploads/${filename}`,
        Expires: 60, // URL expires in 60 seconds
        ContentType: fileType,
      };

      const uploadURL = await s3.getSignedUrlPromise("putObject", params);

      res.status(200).json({ uploadURL });
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      res.status(500).json({ error: "Could not generate pre-signed URL." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}