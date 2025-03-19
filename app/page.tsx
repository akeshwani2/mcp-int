"use client";

import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { MCPConfigForm } from "./components/MCPConfigForm";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { CustomChatUI } from "./components/CustomChatUI";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      {/* Main content area - conditionally show config or chat on mobile */}
      <div className="flex-1 p-4 md:p-8 lg:mr-[30vw] flex flex-col items-center justify-center">
        {isConfigVisible ? (
          <MCPConfigForm />
        ) : (
          <div className="w-full max-w-md text-center mb-12">
            <h1 className="text-3xl font-light mb-6">Echo</h1>
            <p className="text-gray-400 mb-8 text-sm">
              Professional AI assistance for your MCP servers
            </p>
            <button
              onClick={() => setIsConfigVisible(true)}
              className="px-4 py-2 border border-white/20 rounded-md hover:bg-white/10 transition-colors text-sm"
            >
              Configure Servers
            </button>
          </div>
        )}

        {/* Config button always visible on desktop */}
        {/* <div className="fixed top-4 right-4 z-10">
          <button
            onClick={() => setIsConfigVisible(!isConfigVisible)}
            className="p-2 rounded-full bg-black border border-white/20 hover:bg-white/10 transition-colors"
            aria-label="Configure"
          >
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
          </button>
        </div> */}
      </div>

      {/* Mobile chat toggle button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-black text-white rounded-full shadow-lg lg:hidden border border-white/20 hover:bg-white/10 transition-colors"
        aria-label="Toggle chat"
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Centered chatbot - takes more screen space */}
      <div
        className={`fixed inset-0 lg:right-0 lg:left-auto lg:w-[30vw] bg-black border-l border-white/10 shadow-md transition-transform duration-300 ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <CustomChatUI 
          instructions="You are a professional assistant named Echo, providing expert guidance on MCP server configuration and management. Be concise and helpful."
          labels={{
            title: "Echo",
            initial: "Need any help?",
            placeholder: "Ask Echo a question...",
          }}
        />
      </div>
    </div>
  );
}
