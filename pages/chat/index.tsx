import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Layout from '../../components/layout'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Get sessionId from localStorage or URL parameter
    const currentSessionId = localStorage.getItem('sessionId') || new URLSearchParams(window.location.search).get('sessionId')
    if (currentSessionId) {
      setSessionId(currentSessionId)
      fetchPreviousMessages(currentSessionId)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchPreviousMessages = async (sid: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error('Error fetching previous messages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-background">
        <header className="bg-foreground text-background shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Letterizer Chat</h1>
          </div>
        </header>
        <main className="flex-grow flex flex-col p-6">
          <div className="flex-grow overflow-y-auto mb-4 bg-background rounded-lg shadow border border-foreground">
            {messages.map(message => (
              <div
                key={message.id}
                className={`p-4 ${
                  message.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'
                }`}
              >
                <span className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm">
                  {message.content}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow p-2 border border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !sessionId}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading || !sessionId}
            >
              Send
            </button>
          </form>
        </main>
      </div>
    </Layout>
  )
}

