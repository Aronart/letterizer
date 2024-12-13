'use client'

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

const languages = [
  { code: 'en', name: 'English', question: 'Which language would you like to work in?' },
  { code: 'es', name: 'Español', question: '¿En qué idioma le gustaría trabajar?' },
  { code: 'fr', name: 'Français', question: 'Dans quelle langue souhaitez-vous travailler ?' },
  { code: 'de', name: 'Deutsch', question: 'In welcher Sprache möchten Sie arbeiten?' },
  { code: 'ar', name: 'العربية', question: 'بأي لغة ترغب في العمل؟' },
  { code: 'uk', name: 'Українська', question: 'Якою мовою ви хотіли б працювати?' },
  { code: 'ru', name: 'Русский', question: 'На каком языке вы хотели бы работать?' },
  { code: 'zh', name: '中文', question: '您想使用哪种语言工作？' }
]

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [language, setLanguage] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hi, let me help you with your government form. Please upload a picture of the letter.' }
  ])
  //const [sessionId] = useState(uuidv4())
  const [uploading, setUploading] = useState(false)
  const [initialResponseReceived, setInitialResponseReceived] = useState(false)
  //const resultRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const [showSignUpPanel, setShowSignUpPanel] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % languages.length)
    }, 3000) // Change question every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  /* const uploadFileToS3 = async (file: File): Promise<string | null> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      })

      const { uploadURL } = await response.json()

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      return `uploads/${file.name}`
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  } */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      alert("Please upload at least one file.")
      return
    }

    setUploading(true)

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000))


      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Processing your document..." },
      ])

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const dummyResponse = `
# 1. What is this document about?

---

This document is a request for additional documents needed for your residence permit application in München. They need certain papers from you to continue processing your request.


# 2. What do I need to do?

---

There are some steps you need to take to complete your application:

Send the following documents:
- A copy of your current work contract.
- Proof of existing health insurance.
- A copy of your rental agreement.

You can send these documents:
- By mail to the address at the top of the letter.
- Or bring them in person during office hours.

If you have questions, you can:
- Call: 089 233-45261
- Email: buergerbuero222.kvr@muenchen.de


# 3. Important Notes or Warnings

---

- Make sure to submit the documents by the deadline of December 31, 2024.
- If you don't, your application may be delayed.

---
`;

      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: dummyResponse },
      ])

      setInitialResponseReceived(true)
    } catch (error) {
      console.error("Error during processing:", error)
      alert("An error occurred during processing.")
    }

    setUploading(false)
  }

  const handleChatSubmit = async (message: string) => {
    setChatMessages((prev) => [...prev, { role: "user", content: message }])

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add the "Sign up" message after the first user message
      if (!showSignUpPanel) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sign up so I can continue helping you with your government form." },
        ])
        setShowSignUpPanel(true)
      }
    } catch (error) {
      console.error("Error during chat processing:", error)
      alert("An error occurred during chat processing.")
    }
  }

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log("Sign-up submitted", { email, password })

    router.push('/signup/details')
  }

  const closeSignUpPanel = () => {
    setShowSignUpPanel(false)
    setShowFloatingButton(true)
  }

  if (!language) {
    return (
      <div className="fixed inset-0 bg-[#f5f5dc] flex items-center justify-center z-50">
        <div className="bg-[#e6e6c8] rounded-lg p-8 max-w-md w-full shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-[#1e2837]">
            {languages[currentQuestionIndex].question}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="w-full px-4 py-2 bg-[#1e2837] text-[#f5f5dc] rounded hover:bg-[#2a3749] transition-colors"
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5dc]">
      <header className="bg-[#f5f5dc] text-[#1e2837] p-4 border-b border-[#e6e6c8]">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Doculizer</div>
          <div>
            <button onClick={scrollToPricing} className="bg-[#f5f5dc] text-[#1e2837] px-4 py-2 rounded hover:bg-[#e6e6c8] transition-colors mr-4 border border-[#1e2837]">
              See Plans
            </button>
            <button onClick={() => setShowSignUpPanel(true)} className="bg-[#1e2837] text-[#f5f5dc] px-4 py-2 rounded hover:bg-[#2a3749] transition-colors">
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-4xl">
        <div className="mb-8 mt-16">
          <h1 className="text-5xl font-bold mb-4 text-[#1e2837]">Government Forms Annoy. We Help.</h1>
          <p className="text-xl text-[#1e2837] max-w-2xl">
            Outdated mailing communication wastes your time. Doculizer translates, simplifies, and digitizes letters and forms so you can move forward.
          </p>
        </div>

        <div className="bg-[#e6e6c8] p-6 rounded-lg shadow-lg mb-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file-upload" className="block text-xl text-[#1e2837] mb-4">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-4 bg-[#f5f5dc] border border-[#e6e6c8] rounded-lg text-[#1e2837] cursor-pointer text-center"
                  value={files.length > 0 ? files[0].name : ""}
                  placeholder="Select a file..."
                  readOnly
                  onClick={() => document.getElementById('file-upload')?.click()}
                />
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                className="w-full p-4 text-[#1e2837] bg-[#f5f5dc] border border-[#e6e6c8] rounded-lg hover:bg-[#e6e6c8] transition-colors"
                onClick={() => console.log('Take a Picture clicked')}
              >
                Take a Picture
              </button>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className={`w-full p-4 text-[#f5f5dc] bg-[#1e2837] rounded-lg hover:bg-[#2a3749] transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>

        {/* Chat Section */}
        <div className="bg-[#e6e6c8] p-6 rounded-lg shadow-lg mb-16">
          <h2 className="text-xl text-[#1e2837] mb-4">Chat</h2>
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-4 rounded-lg bg-[#f5f5dc] text-[#1e2837] max-w-[80%]`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('chat-input') as HTMLInputElement
            if (input.value.trim() && initialResponseReceived) {
              handleChatSubmit(input.value.trim())
              input.value = ''
            }
          }}>
            <input
              type="text"
              name="chat-input"
              placeholder="Type your message..."
              className="w-full p-4 bg-[#f5f5dc] border border-[#e6e6c8] rounded-lg text-[#1e2837] focus:outline-none focus:ring-2 focus:ring-[#1e2837]"
              disabled={!initialResponseReceived}
            />
          </form>
        </div>

        {/* Pricing Section */}
        <div ref={pricingRef} className="py-16 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="w-full bg-[#e6e6c8] p-8 rounded-lg shadow-lg border border-[#1e2837]">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-[#1e2837]">Free</h3>
                <p className="text-[#1e2837] mb-4">
                  Upload a Picture of your Document and get valuable Insights in the Language of your choice.
                </p>
                <div className="text-3xl font-bold text-[#1e2837]">$0</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-[#1e2837]">
                  <span className="mr-2 text-green-600">✓</span>
                  Single document processing
                </li>
                <li className="flex items-center text-[#1e2837]">
                  <span className="mr-2 text-green-600">✓</span>
                  Basic language translation
                </li>
                <li className="flex items-center text-[#1e2837]">
                  <span className="mr-2 text-green-600">✓</span>
                  Simple document insights
                </li>
              </ul>

              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full px-6 py-3 bg-[#1e2837] text-[#f5f5dc] rounded-md hover:bg-[#2a3749] transition-colors"
              >
                Try It
              </button>
            </div>

            {/* Pro Plan */}
            <div className="w-full bg-[#1e2837] text-[#f5f5dc] p-8 rounded-lg shadow-lg relative overflow-hidden">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="mb-4">
                  Upload, Store & Chat with your Documents in any Language. Digitalization is here.
                </p>
                <div className="text-3xl font-bold">Contact Us</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="mr-2 text-green-400">✓</span>
                  Unlimited document processing
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-400">✓</span>
                  Advanced language translation
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-400">✓</span>
                  Document storage & management
                </li>
              </ul>

              <button 
                onClick={() => window.open("https://airtable.com/app6lF04LIuLbm3Z8/pagg0r3rqobQKG2t6/form", "_blank")}
                className="w-full px-6 py-3 bg-[#f5f5dc] text-[#1e2837] rounded-md hover:bg-[#e6e6c8] transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1e2837] text-[#f5f5dc] p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Doculizer. All rights reserved.</p>
        </div>
      </footer>

      {/* Sign-up Panel */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-[#e6e6c8] shadow-lg transform ${showSignUpPanel ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="p-6">
          <button onClick={closeSignUpPanel} className="absolute top-4 right-4 text-[#1e2837] hover:opacity-70">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold mb-4 text-[#1e2837]">Sign Up for Pro Access</h2>
          <p className="mb-4 text-[#1e2837]">Get unlimited document processing, advanced language translation, and document storage & management.</p>
          <form onSubmit={handleSignUp} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              className="w-full p-4 bg-[#f5f5dc] border border-[#e6e6c8] rounded-lg text-[#1e2837] focus:outline-none focus:ring-2 focus:ring-[#1e2837]" 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              className="w-full p-4 bg-[#f5f5dc] border border-[#e6e6c8] rounded-lg text-[#1e2837] focus:outline-none focus:ring-2 focus:ring-[#1e2837]" 
              required 
            />
            <button type="submit" className="w-full p-4 bg-[#1e2837] text-[#f5f5dc] rounded-lg hover:bg-[#2a3749] transition-colors">
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* Floating Sign-up Button */}
      {showFloatingButton && (
        <button
          onClick={() => setShowSignUpPanel(true)}
          className="fixed bottom-4 right-4 bg-[#1e2837] text-[#f5f5dc] p-4 rounded-full shadow-lg hover:bg-[#2a3749] transition-colors"
        >
          Sign Up
        </button>
      )}
    </div>
  )
}