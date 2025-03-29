"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EmailSummaryDashboard from '../components/EmailSummaryDashboard';
import { ServerTracker } from '../components/ServerTracker';
import { MCPConfigForm } from '../components/MCPConfigForm';
import { X } from 'lucide-react';

const EmailPage = () => {
  const [configOpen, setConfigOpen] = useState(false);
  const [gmailTokens, setGmailTokens] = useState<string | null>(null);

  // Check if user is already authenticated with Gmail
  useEffect(() => {
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
      }
    };
    
    checkGmailAuth();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-16 p-6">
        {/* Server tracker in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <ServerTracker onConfigClick={() => setConfigOpen(true)} />
        </div>
        
        <div className="w-full">
          {gmailTokens ? (
            <EmailSummaryDashboard tokens={gmailTokens} />
          ) : (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-purple-500/20 p-6 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3">Connect Your Email</h3>
                <p className="text-zinc-400 text-center max-w-md mb-6">
                  Connect your Gmail account to view and manage your emails.
                </p>
                <button 
                  onClick={() => {
                    window.location.href = '/api/gmail/auth';
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  Connect Gmail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Server config panel - Modal dialog */}
      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl h-[90vh] bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setConfigOpen(false)}
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
};

export default EmailPage; 