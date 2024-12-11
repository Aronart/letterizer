'use client'

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid'

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
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [sessionId] = useState(uuidv4())
  const [uploading, setUploading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
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

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode)
  }

  const uploadFileToS3 = async (file: File): Promise<string | null> => {
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
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      alert("Please upload at least one file.")
      return
    }

    setUploading(true)

    try {
      const s3Key = await uploadFileToS3(files[0])

      if (s3Key) {
        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key, sessionId }),
        })

        const { extractedText } = await ocrResponse.json()

        if (!extractedText) {
          alert("Failed to extract text from the document.")
          return
        }

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ])

        const openaiResponse = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: extractedText,
            sessionId,
            language,
            action: "summarize",
          }),
        })

        const reader = openaiResponse.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder("utf-8")
          let content = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            content += chunk

            setChatMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content },
            ])
          }
        }

        setShowChat(true)
      } else {
        alert("Failed to upload the file.")
      }
    } catch (error) {
      console.error("Error during processing:", error)
      alert("An error occurred during processing.")
    }

    setUploading(false)
  }

  const handleChatSubmit = async (message: string) => {
    setChatMessages((prev) => [...prev, { role: "user", content: message }])

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          text: message,
          sessionId,
          language,
        }),
      })

      const reader = response.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder("utf-8")
        let content = ""

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          content += chunk

          setChatMessages((prev) => {
            const updatedMessages = [...prev]
            const lastMessageIndex = updatedMessages.findIndex(
              (msg) => msg.role === "assistant" && msg.content === ""
            )
            if (lastMessageIndex !== -1) {
              updatedMessages[lastMessageIndex].content = content
            }
            return updatedMessages
          })
        }
      }
    } catch (error) {
      console.error("Error during chat processing:", error)
      alert("An error occurred during chat processing.")
    }
  }

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!language) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {languages[currentQuestionIndex].question}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Doculizer</div>
          <button onClick={scrollToPricing} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Pricing
          </button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Doculizer</h1>
          <p className="text-xl">Upload your document and get valuable insights in {languages.find(lang => lang.code === language)?.name}.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {/* File Upload Section */}
            <section className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="file-upload" className="text-sm font-medium">
                    Upload File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-white text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-block text-center font-medium text-lg border border-gray-400"
                  >
                    {files.length > 0 ? files[0].name : "Choose File"}
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`bg-blue-500 text-white py-2 px-4 rounded-lg ${
                    uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                  } transition-colors`}
                >
                  {uploading ? "Processing..." : "Submit"}
                </button>
              </form>
            </section>

            {/* Results Section */}
            {showChat && (
              <div ref={resultRef} className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Results</h2>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.currentTarget.elements.namedItem('chat-input') as HTMLInputElement
                  if (input.value.trim()) {
                    handleChatSubmit(input.value.trim())
                    input.value = ''
                  }
                }} className="mt-4 flex">
                  <input
                    type="text"
                    name="chat-input"
                    placeholder="Ask a question..."
                    className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>

          <div>
            <Image
              src="/placeholder-image.jpeg"
              alt="Placeholder"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div ref={pricingRef} className="py-16 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="w-full bg-white p-8 rounded-lg shadow-lg border border-gray-300">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-gray-700 mb-4">
                  Upload a Picture of your Document and get valuable Insights in the Language of your choice.
                </p>
                <div className="text-3xl font-bold">$0</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="mr-2 text-green-600">✓</span>
                  Single document processing
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-600">✓</span>
                  Basic language translation
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-600">✓</span>
                  Simple document insights
                </li>
              </ul>

              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try It
              </button>
            </div>

            {/* Pro Plan */}
            <div className="w-full bg-gray-800 text-white p-8 rounded-lg shadow-lg relative overflow-hidden">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-gray-300 mb-4">
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
              className="w-full px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Doculizer. All rights reserved.</p>
        </div>
      </footer>

      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <div className="bg-yellow-300 text-black p-2 text-center fixed bottom-0 left-0 right-0">
          Demo Mode: Functionality is simulated
        </div>
      )}
    </div>
  )
}

