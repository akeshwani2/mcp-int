"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, CheckSquare, Clock, ExternalLink, Inbox, Mail, RefreshCw } from 'lucide-react';
import { Email } from '@/app/types/email';
import CalendarWidget from './CalendarWidget';

interface EmailSummaryDashboardProps {
  tokens: string | null;
}

interface EmailSummary {
  immediateAction: Email[];
  mediumPriority: Email[];
  other: Email[];
  isLoading: boolean;
}

const getGmailUrl = (emailId: string): string => {
  // Remove any special characters and get just the message ID
  const cleanId = emailId.replace(/[<>]/g, '');
  return `https://mail.google.com/mail/u/0/#inbox/${cleanId}`;
};

// Check if calendar access is available
const hasCalendarAccess = (): boolean => {
  // Check cookies if we're in the browser environment
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').map(c => c.trim());
    return cookies.some(c => c === 'calendar_access=true');
  }
  return false;
};

// Function to handle connecting to Gmail API
const handleConnectGmail = async () => {
  try {
    const response = await fetch('/api/gmail/auth');
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Failed to get auth URL:', error);
  }
};

// Function to handle reconnecting Gmail with calendar permissions
const handleReconnectGmail = async () => {
  try {
    const response = await fetch('/api/gmail/auth');
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Failed to get auth URL:', error);
  }
};

export default function EmailSummaryDashboard({ tokens }: EmailSummaryDashboardProps) {
  const [summary, setSummary] = useState<EmailSummary>({
    immediateAction: [],
    mediumPriority: [],
    other: [],
    isLoading: false
  });
  
  const [parsedTokens, setParsedTokens] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCalendarPermission, setHasCalendarPermission] = useState<boolean>(false);
  
  useEffect(() => {
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        setParsedTokens(parsed);
      } catch (e) {
        console.error('Failed to parse tokens:', e);
      }
    }
    
    // Check for calendar access
    setHasCalendarPermission(hasCalendarAccess());
  }, [tokens]);

  // Function to generate AI summary for an email
  const generateAISummary = async (email: Email): Promise<string> => {
    try {
      const response = await fetch('/api/gmail/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          useGemini: true // Enable Gemini summarization
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      return data.summary || email.subject;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return email.subject; // Fallback to subject if summary generation fails
    }
  };

  // Function to generate summaries for a batch of emails
  const generateSummariesForEmails = async (emails: Email[]): Promise<Email[]> => {
    return Promise.all(
      emails.map(async (email) => {
        const emailWithLoading = {
          ...email,
          isSummaryLoading: true
        };
        
        const aiSummary = await generateAISummary(emailWithLoading);
        
        return {
          ...emailWithLoading,
          aiSummary,
          isSummaryLoading: false
        };
      })
    );
  };

  useEffect(() => {
    const fetchEmails = async () => {
      if (!tokens) return;
      
      setSummary(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      try {
        // Fetch recent emails from our API endpoint
        const response = await fetch('/api/gmail/recent');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch emails: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.emails || data.emails.length === 0) {
          setSummary({
            immediateAction: [],
            mediumPriority: [],
            other: [],
            isLoading: false
          });
          return;
        }
        
        // Format emails
        const allEmails = formatEmails(data.emails);
        
        // Categorize emails
        const immediateAction: Email[] = [];
        const mediumPriority: Email[] = [];
        const other: Email[] = [];
        
        allEmails.forEach(email => {
          const subject = email.subject.toLowerCase();
          const from = email.from.toLowerCase();
          
          // Categorize based on subject and sender patterns
          if (
            subject.includes('urgent') || 
            subject.includes('important') || 
            subject.includes('action required') ||
            subject.includes('asap') ||
            email.labels.includes('IMPORTANT')
          ) {
            immediateAction.push(email);
          } else if (
            subject.includes('meeting') ||
            subject.includes('calendar') ||
            subject.includes('invite') ||
            subject.includes('review') ||
            subject.includes('approval') ||
            subject.includes('zoom') ||
            subject.includes('teams')
          ) {
            mediumPriority.push(email);
          } else {
            other.push(email);
          }
        });
        
        // Limit each category to 3 emails
        const limitedImmediate = immediateAction.slice(0, 3);
        const limitedMedium = mediumPriority.slice(0, 3);
        const limitedOther = other.slice(0, 3);
        
        // Generate AI summaries for all emails
        const immediateActionWithSummaries = await generateSummariesForEmails(limitedImmediate);
        const mediumPriorityWithSummaries = await generateSummariesForEmails(limitedMedium);
        const otherWithSummaries = await generateSummariesForEmails(limitedOther);
        
        setSummary({
          immediateAction: immediateActionWithSummaries,
          mediumPriority: mediumPriorityWithSummaries,
          other: otherWithSummaries,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching emails:', error);
        setError('Failed to fetch emails. Please check your Gmail connection.');
        setSummary(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchEmails();
  }, [tokens]);
  
  // Helper function to format emails
  const formatEmails = (emails: any[]): Email[] => {
    if (!emails) return [];
    
    return emails.map(email => ({
      id: email.id,
      from: email.from?.split("<")[0]?.trim() || email.from,
      to: email.to || "",
      subject: email.subject || "",
      date: new Date(email.date).toLocaleString(),
      snippet: email.snippet || "",
      body: email.body || "",
      html: email.html || "",
      type: email.type || "general",
      importance: email.importance || "low",
      hasAttachments: email.hasAttachments || false,
      labels: email.labels || []
    }));
  };
  
  if (summary.isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-black rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-zinc-400">Loading your email summary...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no tokens, show connect button
  if (!tokens) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-black rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-white mr-2" />
                <h4 className="text-xl font-medium text-white">Email Dashboard</h4>
              </div>
              <p className="text-zinc-400 mb-4 text-center">Connect your Gmail account to see your email summary and important messages.</p>
              <button
                onClick={handleConnectGmail}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
              >
                Connect Gmail
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If error occurred
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-black rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                <h4 className="text-xl font-medium text-white">Error</h4>
              </div>
              <p className="text-zinc-400 mb-4 text-center">{error}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
                <button
                  onClick={handleConnectGmail}
                  className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
                >
                  Reconnect Gmail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no emails found
  if (
    summary.immediateAction.length === 0 && 
    summary.mediumPriority.length === 0 && 
    summary.other.length === 0
  ) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-black rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center">
              <p className="text-zinc-400 mb-4">No emails found in your inbox.</p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full max-w-6xl mx-auto opacity-0 animate-fadeIn"
      style={{ animation: 'fadeIn 0.5s forwards' }}
    >
      <h3 className="text-2xl tracking-tight text-zinc-400 mb-6 text-center">
        <span className="text-white">Your Email & Meeting Summary</span>
      </h3>
      
      {/* Calendar Access Section */}
      {parsedTokens && !hasCalendarPermission && (
        <div className="mb-6 bg-black rounded-xl p-5 border border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <h4 className="text-lg font-medium text-white">Calendar Access</h4>
          </div>
          <div className="flex flex-col space-y-4">
            <p className="text-zinc-400 text-sm">
              To enable calendar-related features like checking your schedule, please reconnect your Gmail account with calendar permissions.
            </p>
            <div>
              <button
                onClick={handleReconnectGmail}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors border border-zinc-700"
              >
                Connect Calendar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Immediate Action Emails */}
        <div className="bg-black rounded-xl p-5 border border-zinc-800 h-full flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-white" />
            <h4 className="text-lg text-white tracking-tight font-medium">High Priority</h4>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {summary.immediateAction.length > 0 ? (
              summary.immediateAction.map((email) => (
                <a 
                  key={email.id} 
                  href={getGmailUrl(email.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-white line-clamp-2 leading-snug">
                      {email.isSummaryLoading ? (
                        <span className="inline-flex items-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-2"></span>
                          {email.subject}
                        </span>
                      ) : (
                        <span className="text-white">{email.aiSummary || email.subject}</span>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-1 ml-2" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <div className="text-xs text-zinc-300">
                      {email.from}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {email.date}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No high priority emails found</p>
            )}
          </div>
        </div>
        
        {/* Combined Medium Priority and Other Emails */}
        <div className="bg-black rounded-xl p-5 border border-zinc-800 h-full flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="w-5 h-5 text-white" />
            <h4 className="text-lg font-medium text-white">Other</h4>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {[...summary.mediumPriority, ...summary.other].length > 0 ? (
              [...summary.mediumPriority, ...summary.other].slice(0, 5).map((email) => (
                <a 
                  key={email.id} 
                  href={getGmailUrl(email.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-white line-clamp-2 leading-snug">
                      {email.isSummaryLoading ? (
                        <span className="inline-flex items-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-2"></span>
                          {email.subject}
                        </span>
                      ) : (
                        <span className="text-white">{email.aiSummary || email.subject}</span>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-1 ml-2" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <div className="text-xs text-zinc-300">
                      {email.from}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {email.date}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No other emails found in your inbox</p>
            )}
          </div>
        </div>
        
        {/* Calendar Widget */}
        {parsedTokens && (
          <div className="md:col-span-2 lg:col-span-1">
            <CalendarWidget tokens={tokens} />
          </div>
        )}
      </div>
    </div>
  );
} 