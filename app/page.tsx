"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState("en");
  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [sessionId] = useState(uuidv4());
  const [uploading, setUploading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const uploadFileToS3 = async (file: File): Promise<string | null> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      });

      const { uploadURL } = await response.json();

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return `uploads/${file.name}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    setUploading(true);

    try {
      const s3Key = await uploadFileToS3(files[0]);

      if (s3Key) {
        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key, sessionId }),
        });

        const { extractedText } = await ocrResponse.json();

        if (!extractedText) {
          alert("Failed to extract text from the document.");
          return;
        }

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        const openaiResponse = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: extractedText,
            sessionId,
            language,
            action: "summarize",
          }),
        });

        const reader = openaiResponse.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder("utf-8");
          let content = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            content += chunk;

            setChatMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content },
            ]);
          }
        }

        setShowChat(true);
      } else {
        alert("Failed to upload the file.");
      }
    } catch (error) {
      console.error("Error during processing:", error);
      alert("An error occurred during processing.");
    }

    setUploading(false);
  };

  /* const handleChatSubmit = async (message: string) => {
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

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
      });

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder("utf-8");
        let content = "";

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          content += chunk;

          setChatMessages((prev) => {
            const updatedMessages = [...prev];
            const lastMessageIndex = updatedMessages.findIndex(
              (msg) => msg.role === "assistant" && msg.content === ""
            );
            if (lastMessageIndex !== -1) {
              updatedMessages[lastMessageIndex].content = content;
            }
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error during chat processing:", error);
      alert("An error occurred during chat processing.");
    }
  }; */

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="font-sans bg-[#f5f5dc] text-gray-800 min-h-screen">
      <div className="bg-[#f5f5dc] text-gray-800">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 border-b border-gray-300 sticky top-0 bg-[#f5f5dc] z-50">
          <div className="text-xl font-bold">Doculizer</div>
          <div className="flex gap-4 items-center">
            <button
              onClick={scrollToPricing}
              className="px-4 py-2 bg-transparent text-gray-800 hover:bg-[#e6e6c7] rounded-lg transition-colors border border-gray-400"
            >
              See Plans
            </button>
            <button
              onClick={() => window.open("https://airtable.com/app6lF04LIuLbm3Z8/pagg0r3rqobQKG2t6/form", "_blank")}
              className="px-4 py-2 bg-gray-800 text-[#f5f5dc] rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Hero and Upload Section */}
          <div className="flex flex-col md:flex-row mb-24">
            {/* Left side: Hero content and Upload form */}
            <div className="w-full md:w-1/2 space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl font-extrabold">
                  Government Forms Annoy.
                  We Help.
                </h1>
                <p className="text-lg text-gray-700">
                  Outdated mailing communication wastes your time. Doculizer translates, simplifies, and digitizes letters and forms so you can move forward.
                </p>
              </div>

              {/* File Upload Section */}
              <section className="bg-[#e6e6c7] p-6 rounded-lg shadow-lg border border-gray-300">
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
                      className="cursor-pointer bg-[#f5f5dc] text-gray-800 py-3 px-4 rounded-lg hover:bg-[#e6e6c7] transition-colors inline-block text-center font-medium text-lg border border-gray-400"
                    >
                      {files.length > 0 ? files[0].name : "Choose File"}
                    </label>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="language-select" className="text-sm font-medium">
                      Which language would you like to work in?
                    </label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={handleLanguageChange}
                      className="border border-gray-400 rounded-lg p-2 w-full bg-[#f5f5dc] text-gray-800"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ar">Arabic</option>
                      <option value="uk">Ukrainian</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`bg-gray-800 text-[#f5f5dc] py-2 px-4 rounded-lg ${
                      uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
                    } transition-colors`}
                  >
                    {uploading ? "Processing..." : "Submit"}
                  </button>
                </form>
              </section>
            </div>

            {/* Right side: Placeholder Image / Result and Chat */}
            <div className="w-full md:w-1/2 md:pl-8 mt-8 md:mt-0" ref={resultRef}>
              <div className="relative">
                {/* Placeholder Image */}
                <div className={`transition-all duration-500 ease-in-out ${showChat ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
                  <Image
                    src="/placeholder-image.jpeg"
                    alt="Placeholder"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Result and Chat Section */}
                <div
                  className={`transition-all duration-500 ease-in-out relative z-10 ${
                    showChat ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"
                  } overflow-hidden`}
                >
                  <div className="bg-[#e6e6c7] p-6 rounded-lg shadow-lg border border-gray-300 space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Chat</h2>
                    <div className="border border-gray-400 p-4 rounded-lg h-64 overflow-y-auto bg-[#f5f5dc]">
                      {chatMessages.map((message, index) => (
                        <div key={index} className="mb-4">
                          <strong className="block text-gray-700">
                            {message.role === "user" ? "You" : "Assistant"}:
                          </strong>
                          <pre className="whitespace-pre-wrap text-gray-800">
                            {message.content}
                          </pre>
                        </div>
                      ))}
                    </div>

                    {/* Temporary switch between form redirection and chat behavior */}
                    <form
                      onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();

                        // Comment out this block when re-enabling dynamic chat
                        window.open(
                          "https://airtable.com/app6lF04LIuLbm3Z8/pagyka1WMIl8kC0bh/form",
                          "_blank"
                        );

                        // Uncomment this block to restore dynamic chat behavior
                        // const message = (
                        //   e.currentTarget.elements.namedItem("message") as HTMLInputElement
                        // ).value;
                        // handleChatSubmit(message);
                        // e.currentTarget.reset();
                      }}
                      className="flex space-x-4"
                    >
                      <input
                        type="text"
                        name="message"
                        placeholder="Ask a question..."
                        className="flex-1 border border-gray-400 rounded-lg p-2 bg-[#f5f5dc] text-gray-800"
                      />
                      <button
                        type="submit"
                        className="bg-gray-800 text-[#f5f5dc] py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div ref={pricingRef} className="py-16 scroll-mt-20">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="w-full bg-[#e6e6c7] p-8 rounded-lg shadow-lg border border-gray-300">
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
                  className="w-full px-6 py-3 bg-gray-800 text-[#f5f5dc] rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try It
                </button>
              </div>

              {/* Pro Plan */}
              <div className="w-full bg-gray-800 text-[#f5f5dc] p-8 rounded-lg shadow-lg relative overflow-hidden">
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
                    Advanced language translation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-green-400">✓</span>
                    Document storage & management
                  </li>
                </ul>

                <button 
                onClick={() => window.open("https://airtable.com/app6lF04LIuLbm3Z8/pagg0r3rqobQKG2t6/form", "_blank")}
                className="w-full px-6 py-3 bg-[#f5f5dc] text-gray-800 rounded-lg hover:bg-[#e6e6c7] transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
