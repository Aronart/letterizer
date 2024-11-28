"use client";

import { useRef } from "react";

export default function Home() {
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth" });
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
          <button className="px-4 py-2 bg-black text-white rounded">Sign In</button>
        </div>
      </nav>

      {/* Above-the-Fold Section */}
      <header className="flex items-center justify-between p-12 bg-gray-50 min-h-[80vh]">
        {/* Left Content */}
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
        {/* Right Content */}
        <div className="w-1/2">
          <img
            src="/placeholder-image.png"
            alt="Placeholder"
            className="w-full h-auto"
          />
        </div>
      </header>

      {/* Below-the-Fold Section: Embedded Airtable Form */}
      <div ref={formSectionRef} className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Submit Your Form</h2>
        <iframe
          className="airtable-embed"
          src="https://airtable.com/embed/app5grOBv8PHGr3PU/pag3x9bbNyVZh9zhV/form"
          width="100%"
          height="600"
          style={{ background: "transparent", border: "1px solid #ccc" }}
        ></iframe>
      </div>
    </div>
  );
}