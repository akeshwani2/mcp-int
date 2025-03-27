"use client";

import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { MCPConfigForm } from "./components/MCPConfigForm";
import { Sidebar } from "./components/Sidebar";
import { ServerTracker } from "./components/ServerTracker";
import { useState, useEffect } from "react";
import { ArrowUp, X } from "lucide-react";
import { CustomChatUI } from "./components/CustomChatUI";

export default function Home() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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
      setCurrentPage("home");
    } else if (page === "docs") {
      setCurrentPage("docs");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-white flex relative">
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      {/* Pill-shaped sidebar */}
      <Sidebar onNavigate={handleNavigation} onConfigClick={() => setIsConfigOpen(true)} />

      {/* Main content area - Now full width for chat */}
      <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden">
        {/* Server tracker */}
        <div className="absolute top-4 right-4 z-10">
          <ServerTracker />
        </div>
        
        {/* Chat UI takes the full area */}
        <div className="w-full h-full max-w-6xl mx-auto overflow-hidden">
          <CustomChatUI
            instructions="You are a professional assistant named Echo, providing expert guidance on MCP server configuration and management. Be concise and helpful."
            labels={{
              title: "",
              initial: "How can I help you today?",
              placeholder: "Ask Echo a question...",
            }}
          />
        </div>
      </div>

      {/* Server config panel - Now in a modal dialog that appears when clicking the server tab */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl h-[90vh] bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors z-10"
              aria-label="Close config"
            >
              <X size={20} />
            </button>
            <div className="h-full overflow-auto">
              <MCPConfigForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
