'use client'

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Layout from '../../components/layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui"
import { DocumentUpload } from '../../components/DocumentUpload'
import ReactMarkdown from 'react-markdown'
import { Folder, MessageSquare, ArrowRight, X } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
}

type Document = {
  id: string
  name: string
  category: string
  uploadDate: string
}

type Reminder = {
  id: string
  title: string
  date: string
}

type TodoItem = {
  id: string
  text: string
  completed: boolean
}

type ChatFolder = {
  id: string
  name: string
  icon: React.ElementType
  typingName: string
}

const INITIAL_CHAT_FOLDERS: ChatFolder[] = [
  { id: 'residence-permit', name: 'Residence Permit', icon: Folder, typingName: '' },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: uuidv4(),
    role: 'assistant',
    content: '1. What is this document about?\n__________________________________________________________________________________________________________________________________________\nThis document is a request for additional documents needed for your residence permit application in München. They need certain papers from you to continue processing your request.\n__________________________________________________________________________________________________________________________________________\n2. What do I need to do?\n__________________________________________________________________________________________________________________________________________\nThere are some steps you need to take to complete your application.\n2.1. Send the following documents by December 31, 2024:\n- A copy of your current work contract.\n- Proof of existing health insurance.\n- A copy of your rental agreement.\nYou can send these documents by mail to the address at the top, or you can bring them in person during office hours.\n2.2. If you have questions, you can call 089 233-45261 or email buergerbuero222.kvr@muenchen.de.\n__________________________________________________________________________________________________________________________________________\n3. Important Notes or Warnings\n__________________________________________________________________________________________________________________________________________\nMake sure to submit the documents by the deadline of December 31, 2024. If you don\'t, your application may be delayed.\n__________________________________________________________________________________________________________________________________________'
  },
  {
    id: uuidv4(),
    role: 'user',
    content: 'where do i have to send it?'
  }
]

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: uuidv4(),
    name: 'Residence Permit Request.pdf',
    category: 'Residence Permit',
    uploadDate: '2024-12-13'
  }
]

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: uuidv4(),
    title: 'Submit Residence Permit Documents',
    date: '2024-12-31'
  }
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS)
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS)
  const [todoItems, setTodoItems] = useState<TodoItem[]>([])
  const [todoListTyping, setTodoListTyping] = useState('')
  const [selectedChat, setSelectedChat] = useState('residence-permit')
  const [chatFolders, setChatFolders] = useState(INITIAL_CHAT_FOLDERS)
  const [showTaxFolder, setShowTaxFolder] = useState(false)
  const [showTaxDialog, setShowTaxDialog] = useState(false)
  const [taxDialogTyping, setTaxDialogTyping] = useState('')
  const [showPremiumPopup, setShowPremiumPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const typeText = useCallback(async (text: string, setter: (value: string) => void) => {
    for (let i = 0; i <= text.length; i++) {
      setter(text.slice(0, i))
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }, [])

  useEffect(() => {
    const selectedFolder = chatFolders.find(folder => folder.id === selectedChat)
    if (selectedFolder && selectedFolder.typingName === '') {
      typeText(selectedFolder.name, (value) => {
        setChatFolders(prev => prev.map(folder => 
          folder.id === selectedChat ? { ...folder, typingName: value } : folder
        ))
      })
    }
  }, [selectedChat, typeText, chatFolders])

  const simulateContinuedConversation = useCallback(async () => {
    setIsLoading(true)
    const newMessages = [
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "Thank you for signing up Marek! Let's continue where we left off."
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "Here is a to-do list for the residence permit application:"
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "- Current employment contract\n- Updated proof of health insurance coverage\n- Copy of rental agreement"
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "Here are some helpful links for the documents you need:\n\n- [Employment Contract Template](https://www.arbeitsvertrag.org/muster-arbeitsvertrag/)\n- [Health Insurance Information](https://www.krankenkassen.de/gesetzliche-krankenkassen/krankenkassen-liste/)\n- [Rental Agreement Guide](https://www.mieterbund.de/mietvertrag.html)"
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "Once you have all the documents, you can also resubmit your application for the residence permit online. Go to: [Munich KVR - Residence Permit](https://stadt.muenchen.de/service/en-GB/info/hauptabteilung-ii-buergerangelegenheiten/10424868/)"
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "I've set up email reminders for you as the deadline approaches. You'll receive notifications:\n\n1. 1 week before the due date\n2. 3 days before the due date"
      },
      {
        id: uuidv4(),
        role: 'assistant' as const,
        content: "Is there anything else you'd like help with?"
      }
    ]

    for (const message of newMessages) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds delay
      setMessages(prev => [...prev, { ...message, isTyping: true }])
      await typeText(message.content, (value) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === message.id ? { ...msg, content: value, isTyping: value.length < message.content.length } : msg
          )
        )
      })
      
      if (message.content.includes("- Current employment contract")) {
        const todoList = message.content.split('\n').map(item => ({
          id: uuidv4(),
          text: item.trim().replace('- ', ''),
          completed: false
        }))
        setTodoItems(todoList)
        await typeText("To-Do List", setTodoListTyping)
      }
    }
    setIsLoading(false)

    // Show the tax dialog first
    setShowTaxDialog(true)
    await typeText("Marek, we've added a new Taxes chat to help you with your tax-related questions.", setTaxDialogTyping)

    // Wait for 5 seconds before showing the Tax folder
    await new Promise(resolve => setTimeout(resolve, 5000))
    setShowTaxFolder(true)
    setChatFolders(prev => [...prev, { id: 'taxes', name: 'Taxes', icon: Folder, typingName: '' }])
    
    // Type out the name of the Tax folder
    await typeText('Taxes', (value) => {
      setChatFolders(prev => prev.map(folder => 
        folder.id === 'taxes' ? { ...folder, typingName: value } : folder
      ))
    })
  }, [typeText])

  useEffect(() => {
    simulateContinuedConversation()
  }, [simulateContinuedConversation])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I understand your question about "${input}". Let me help you with that...`
      }
      setMessages(prev => [...prev, { ...assistantMessage, isTyping: true }])
      await typeText(assistantMessage.content, (value) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id ? { ...msg, content: value, isTyping: value.length < assistantMessage.content.length } : msg
        ))
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatFolderClick = (folderId: string) => {
    if (folderId === 'taxes') {
      setShowPremiumPopup(true);
    } else {
      setSelectedChat(folderId);
    }
  };

  const FormattedMessage: React.FC<{ content: string; role: 'user' | 'assistant'; isTyping?: boolean }> = ({ content, role, isTyping }) => {
    return (
      <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-4 rounded-lg ${
            role === 'user' ? 'bg-[#1e2837] text-[#f5f5dc]' : 'bg-[#f0f0d8] text-[#1e2837]'
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isTyping && <span className="inline-block animate-pulse">▋</span>}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex h-screen bg-[#f5f5dc]">
        <aside className="w-64 bg-[#e6e6c8] p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-[#1e2837]">Chats</h2>
          <div className="space-y-2">
            {chatFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleChatFolderClick(folder.id)}
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                  selectedChat === folder.id
                    ? 'bg-[#1e2837] text-[#f5f5dc]'
                    : 'hover:bg-[#d1d1b3] text-[#1e2837]'
                }`}
              >
                <folder.icon className="w-5 h-5 mr-2" />
                <span>{folder.typingName || folder.name}</span>
                {folder.typingName !== folder.name && folder.typingName !== '' && (
                  <span className="inline-block animate-pulse ml-1">▋</span>
                )}
                {selectedChat === folder.id && (
                  <MessageSquare className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
          <h2 className="text-lg font-semibold mt-6 mb-4 text-[#1e2837]">Reminders</h2>
          <div className="space-y-2">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center space-x-2 p-2 hover:bg-[#d1d1b3] rounded text-[#1e2837]">
                <span className="w-5 h-5">🔔</span>
                <span>{reminder.title}</span>
              </div>
            ))}
          </div>
          {todoItems.length > 0 && (
            <div className="mt-6 transition-all duration-500 ease-in-out" style={{ opacity: 1, transform: 'translateY(0)' }}>
              <h2 className="text-lg font-semibold mb-4 text-[#1e2837]">
                {todoListTyping}
                {todoListTyping !== "To-Do List" && <span className="inline-block animate-pulse">▋</span>}
              </h2>
              <div className="space-y-4">
                {todoItems.map(item => (
                  <div key={item.id} className="flex items-start space-x-3 p-2 hover:bg-[#d1d1b3] rounded group text-[#1e2837]">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => setTodoItems(prev =>
                        prev.map(todo =>
                          todo.id === item.id ? { ...todo, completed: !todo.completed } : todo
                        )
                      )}
                      className="mt-1 h-5 w-5 rounded border-[#1e2837] text-[#1e2837] focus:ring-[#1e2837]"
                    />
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
        <main className="flex-1 flex flex-col">
          <header className="bg-[#1e2837] text-[#f5f5dc] shadow p-4">
            <h1 className="text-2xl font-bold">Doculizer Dashboard</h1>
          </header>
          <div className="flex-1 p-6 overflow-y-auto bg-[#f5f5dc]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-[#e6e6c8] border-[#1e2837]">
                <CardHeader>
                  <CardTitle className="text-[#1e2837]">Document Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={33} className="bg-[#f5f5dc]" />
                  <p className="mt-2 text-sm text-[#1e2837]">1 of 3 documents uploaded</p>
                </CardContent>
              </Card>
              <Card className="bg-[#e6e6c8] border-[#1e2837]">
                <CardHeader>
                  <CardTitle className="text-[#1e2837]">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-[#1e2837]">
                    <span className="w-5 h-5">📅</span>
                    <span>Submit Residence Permit Documents by December 31, 2024</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="bg-[#e6e6c8] rounded-lg shadow p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-[#1e2837]">Recent Activity</h2>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-[#d1d1b3] rounded text-[#1e2837]">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5">📄</span>
                      <span>{doc.name}</span>
                    </div>
                    <span className="text-sm text-[#1e2837]">{doc.uploadDate}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#e6e6c8] rounded-lg shadow mb-6">
              <div className="p-4 border-b border-[#1e2837]">
                <h2 className="text-xl font-semibold text-[#1e2837]">Upload Documents</h2>
              </div>
              <div className="p-4">
                <DocumentUpload />
              </div>
            </div>
            <div className="bg-[#e6e6c8] rounded-lg shadow">
              <div className="p-4 border-b border-[#1e2837]">
                <h2 className="text-xl font-semibold text-[#1e2837]">Chat Assistant</h2>
              </div>
              <div className="h-96 overflow-y-auto p-4">
                {messages.map(message => (
                  <FormattedMessage key={message.id} content={message.content} role={message.role} isTyping={message.isTyping} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="p-4 border-t border-[#1e2837]">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 p-2 border rounded bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading} className="bg-[#1e2837] text-[#f5f5dc] hover:bg-[#2a3749]">
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </div>
          {showTaxDialog && (
            <div className="fixed top-20 left-64 bg-[#1e2837] text-[#f5f5dc] p-4 rounded-lg shadow-lg max-w-sm z-10">
              <p className="mb-2">
                {taxDialogTyping}
                {taxDialogTyping !== "Marek, we've added a new Taxes chat to help you with your tax-related questions." && (
                  <span className="inline-block animate-pulse">▋</span>
                )}
              </p>
              <div className="flex items-center mt-2">
                <ArrowRight className="w-5 h-5 mr-2" />
                <span>Check out the new Taxes chat</span>
              </div>
            </div>
          )}
        </main>
      </div>
      {showPremiumPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#e6e6c8] p-6 rounded-lg max-w-md w-full relative">
            <button 
              onClick={() => setShowPremiumPopup(false)} 
              className="absolute top-2 right-2 text-[#1e2837] hover:text-[#2a3749]"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#1e2837]">Upgrade to Premium</h2>
            <p className="mb-4 text-[#1e2837]">Starting new chats and accessing advanced features requires a premium subscription.</p>
            <p className="mb-4 text-[#1e2837]">Unlock premium features:</p>
            <ul className="list-disc pl-5 mb-4 text-[#1e2837]">
              <li>Start new chat topics</li>
              <li>Advanced document analysis</li>
              <li>Priority support</li>
              <li>Unlimited assistance across all topics</li>
            </ul>
            <Button onClick={() => setShowPremiumPopup(false)} className="w-full bg-[#1e2837] text-[#f5f5dc] hover:bg-[#2a3749]">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </Layout>
  )
}

