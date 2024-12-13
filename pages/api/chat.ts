import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, documentContext } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are a helpful assistant for Doculizer, a service that helps people understand government documents. 
          The user has uploaded a document with the following content: ${documentContext}
          Provide assistance based on this context.` 
        },
        { role: "user", content: message }
      ],
    })

    const aiResponse = completion.choices[0].message.content

    res.status(200).json({ message: aiResponse })
  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
}