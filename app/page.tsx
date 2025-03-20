"use client";

import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { MCPConfigForm } from "./components/MCPConfigForm";
import { Sidebar } from "./components/Sidebar";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { CustomChatUI } from "./components/CustomChatUI";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // Force dark mode and prevent body scrolling
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleNavigation = (page: string) => {
    if (page === "home") {
      setIsChatOpen(true);
    } else if (page === "docs") {
      setCurrentPage("docs");
      setIsConfigVisible(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-white flex relative">
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      {/* Pill-shaped sidebar */}
      <Sidebar onNavigate={handleNavigation} />

      {/* Main content area - Now for chat, not configs */}
      <div className="flex-1 p-4 md:p-8 lg:pl-8 lg:pr-[32vw] flex flex-col overflow-hidden">
        {/* Chat UI takes the main area */}
        <div className="w-full h-full max-w-5xl mx-auto overflow-hidden">
          <CustomChatUI
            instructions="You are a professional assistant named Echo, providing expert guidance on MCP server configuration and management. Be concise and helpful."
            labels={{
              title: "",
              initial: "How can I help you?",
              placeholder: "Ask Echo a question...",
            }}
          />
        </div>
      
        
      </div>

      {/* Mobile chat toggle button - Now toggles config panel instead */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-black text-white rounded-full shadow-lg lg:hidden border border-white/20 hover:bg-white/10 transition-colors"
        aria-label="Toggle config"
      >
        {isChatOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>

      {/* Server config panel - Now on the right side with smaller width */}
      <div
        className={`fixed inset-0 lg:right-0 lg:left-auto lg:w-[30vw] bg-black border-l border-white/10 shadow-md transition-transform duration-300 overflow-hidden ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <MCPConfigForm />
      </div>
    </div>
  );
}
