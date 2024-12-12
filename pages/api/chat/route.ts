import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { sessionId } = req.query

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('chat_history')
        .eq('session_id', sessionId)
        .single()

      if (error) throw error

      // If chat_history is null, return empty array
      const messages = data?.chat_history || []

      res.status(200).json({ messages })
    } catch (error) {
      console.error('Error fetching chat history:', error)
      res.status(500).json({ error: 'Failed to fetch chat history' })
    }
  } else if (req.method === 'POST') {
    const { message, sessionId } = req.body

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' })
    }

    try {
      // First, get the current chat_history
      const { data: sessionData, error: fetchError } = await supabase
        .from('sessions')
        .select('chat_history')
        .eq('session_id', sessionId)
        .single()

      if (fetchError) throw fetchError

      // Create new messages
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }

      // Here you would typically process the message using your AI model
      const aiResponse = `You said: "${message}"`
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      // Combine existing chat history with new messages
      const existingMessages = sessionData?.chat_history || []
      const updatedChatHistory = [...existingMessages, userMessage, assistantMessage]

      // Update the session with new chat history
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ chat_history: updatedChatHistory })
        .eq('session_id', sessionId)

      if (updateError) throw updateError

      res.status(200).json({ message: aiResponse })
    } catch (error) {
      console.error('Error processing chat message:', error)
      res.status(500).json({ error: 'Failed to process chat message' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

