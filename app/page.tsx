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
  const [gmailTokens, setGmailTokens] = useState<string | null>(null);
  const [assistantPreferences, setAssistantPreferences] = useState({
    emailEnabled: false,
    calendarEnabled: false,
    tasksEnabled: false,
    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationsEnabled: false,
    proactiveHelp: true
  });

  // Force dark mode and prevent body scrolling
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    // Check if user is already authenticated with Gmail
    const checkGmailAuth = () => {
      // Check for cookies that indicate Gmail is connected
      const cookies = document.cookie.split(';').map(c => c.trim());
      const gmailConnected = cookies.some(c => c.startsWith('gmail_connected='));
      const tokenCookie = cookies.find(c => c.startsWith('gmail_tokens='));
      
      if (gmailConnected && tokenCookie) {
        // If token cookie exists, use that
        const tokenValue = tokenCookie.split('=')[1];
        try {
          const decodedValue = decodeURIComponent(tokenValue);
          setGmailTokens(decodedValue);
          setAssistantPreferences(prev => ({ ...prev, emailEnabled: true }));
          return;
        } catch (e) {
          console.error('Failed to decode token cookie:', e);
        }
      }
      
      // If no tokens in cookies, use environment variables
      const envTokens = {
        access_token: process.env.NEXT_PUBLIC_GMAIL_ACCESS_TOKEN || "",
        refresh_token: process.env.NEXT_PUBLIC_GMAIL_REFRESH_TOKEN || "",
        token_type: "Bearer",
        scope: "https://www.googleapis.com/auth/gmail.readonly"
      };
      
      if (envTokens.access_token && envTokens.refresh_token) {
        setGmailTokens(JSON.stringify(envTokens));
        setAssistantPreferences(prev => ({ ...prev, emailEnabled: true }));
      }
    };
    
    checkGmailAuth();
    
    // Load assistant preferences from local storage if available
    const loadPreferences = () => {
      const storedPrefs = localStorage.getItem('assistantPreferences');
      if (storedPrefs) {
        try {
          const prefs = JSON.parse(storedPrefs);
          setAssistantPreferences(prev => ({ ...prev, ...prefs }));
        } catch (e) {
          console.error('Failed to parse stored preferences:', e);
        }
      }
    };
    
    loadPreferences();
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('assistantPreferences', JSON.stringify(assistantPreferences));
  }, [assistantPreferences]);

  const handleNavigation = (page: string) => {
    if (page === "home") {
      setCurrentPage("home");
    } else if (page === "docs") {
      setCurrentPage("docs");
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-white flex relative">
      <CopilotActionHandler />

      {/* Pill-shaped sidebar */}
      <Sidebar />

      {/* Main content area - Now full width for chat */}
      <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden">
        {/* Server tracker and Gmail status indicator */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          {/* <div className="flex items-center">
            {gmailTokens ? (
              <div className="flex items-center bg-zinc-900 rounded-full px-2 py-0.5 border border-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                <span className="text-xs text-zinc-400 mr-2">Gmail</span>
                <button 
                  onClick={() => {
                    // Clear any existing tokens
                    document.cookie = "gmail_tokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "gmail_connected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    // Reload page
                    window.location.href = '/api/gmail/auth?force_refresh=true';
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Reconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center bg-zinc-900 rounded-full px-2 py-0.5 border border-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                <span className="text-xs text-zinc-400 mr-2">Gmail</span>
                <button 
                  onClick={() => {
                    window.location.href = '/api/gmail/auth';
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Connect
                </button>
              </div>
            )}
          </div> */}
          <ServerTracker onConfigClick={() => setIsConfigOpen(true)} />
        </div>
        
        {/* Chat UI takes the full area */}
        <div className="w-full flex-1 max-w-6xl mx-auto overflow-hidden">
          <CustomChatUI
            instructions={`You are Echo, a helpful and versatile personal assistant. You help the user manage their email, calendar, tasks, and answer questions.
            
Current assistant preferences:
- Email integration: ${assistantPreferences.emailEnabled ? 'Enabled' : 'Disabled'}
- Calendar integration: ${assistantPreferences.calendarEnabled ? 'Enabled' : 'Disabled'}
- Task management: ${assistantPreferences.tasksEnabled ? 'Enabled' : 'Disabled'}
- User timezone: ${assistantPreferences.userTimezone}
- Proactive help: ${assistantPreferences.proactiveHelp ? 'Enabled' : 'Disabled'}

Be concise but friendly in your responses. If a service isn't enabled yet, guide the user on how to enable it.`}
            labels={{
              title: "",
              initial: "How can I help you today?",
              placeholder: "Ask Echo anything...",
            }}
            tokens={gmailTokens}
          />
        </div>
      </div>

      {/* Server config panel - Now in a modal dialog that appears when clicking the server tab */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-xl h-auto max-h-[80vh] overflow-hidden shadow-xl">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
              aria-label="Close config"
            >
              <X size={20} />
            </button>
            <div className="overflow-auto">
              <MCPConfigForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
