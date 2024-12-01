"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState("en");
  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [sessionId] = useState(uuidv4());
  const [uploading, setUploading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  const handleSubmit = async () => {
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
          body: JSON.stringify({
            s3Key,
            sessionId,
          }),
        });

        const { extractedText } = await ocrResponse.json();

        if (extractedText) {
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

          const { result } = await openaiResponse.json();

          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: result },
          ]);
          setShowChat(true);
        } else {
          alert("Failed to extract text from the document.");
        }
      } else {
        alert("Failed to upload the file.");
      }
    } catch (error) {
      console.error("Error during processing:", error);
      alert("An error occurred during processing.");
    }

    setUploading(false);
  };

  const handleChatSubmit = async (message: string) => {
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
  
      const { result } = await response.json();
  
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: result },
      ]);
    } catch (error) {
      console.error("Error during chat processing:", error);
      alert("An error occurred during chat processing.");
    }
  };

  return (
    <div className="font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white shadow">
        <div className="text-xl font-bold">Temp</div>
        <div className="flex items-center space-x-6">
          <a href="#benefits" className="text-gray-600 hover:text-gray-800">
            Benefits
          </a>
          <a href="#features" className="text-gray-600 hover:text-gray-800">
            Features
          </a>
          <a href="#about-us" className="text-gray-600 hover:text-gray-800">
            About Us
          </a>
          <button className="px-4 py-2 bg-black text-white rounded">
            Sign In
          </button>
        </div>
      </nav>

      {/* Above-the-Fold Section */}
      <header className="flex items-center justify-between p-12 bg-gray-50 min-h-[80vh]">
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Simplify your government forms.
          </h1>
          <p className="text-lg text-gray-600">
            Temp is an online assistant to simplify and translate all your
            forms, making filling out forms and acting on them easy.
          </p>
          <button
            onClick={scrollToForm}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
        <div className="w-1/2">
          <img
            src="/placeholder-image.png"
            alt="Placeholder"
            className="w-full h-auto"
          />
        </div>
      </header>

      {/* File Upload Section */}
      <section
        ref={formSectionRef}
        className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-8"
      >
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col space-y-4"
        >
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="border border-gray-300 rounded p-2 w-full"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="nl">Dutch</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
          </select>
          <button
            type="submit"
            disabled={uploading}
            className={`bg-blue-500 text-white py-2 px-4 rounded ${
              uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {uploading ? "Processing..." : "Submit"}
          </button>
        </form>
      </section>

      {/* Chat Section (Only visible after processing) */}
      {showChat && (
        <section className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-8">
          <h2 className="text-2xl font-bold mb-4">Chat</h2>
          <div className="border border-gray-300 p-4 rounded h-64 overflow-y-auto bg-gray-50">
            {chatMessages.map((message, index) => (
              <div key={index} className="mb-4">
                <strong className="block text-gray-700">
                  {message.role === "user" ? "You" : "Assistant"}:
                </strong>
                <p className="text-gray-900">{message.content}</p>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const message = (
                e.currentTarget.elements.namedItem("message") as HTMLInputElement
              ).value;
              handleChatSubmit(message);
              e.currentTarget.reset();
            }}
            className="mt-4 flex space-x-4"
          >
            <input
              type="text"
              name="message"
              placeholder="Ask a question..."
              className="flex-1 border border-gray-300 rounded p-2"
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}