"use client";

import { useCopilotChat, UseCopilotChatOptions } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, StopCircle, Calendar, CheckSquare, Mail, Clock } from "lucide-react";
import { Markdown } from "@copilotkit/react-ui";
import { ToolCallRenderer } from "./ToolCallRenderer";

interface CustomChatUIProps {
  instructions: string;
  labels?: {
    title: string;
    initial: string;
    placeholder: string;
  };
  tokens?: string | null;
}

// Add this to eslint.config.mjs to suppress any type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChatMessage = any;

// Helper function to convert tool names to display-friendly format
const getDisplayName = (name: string): string => {
  if (!name) return "Unknown Tool";
  
  // Map specific tool names to friendly display names
  const nameMap: Record<string, string> = {
    'GMAIL_FETCH_EMAILS': 'Using Gmail Tool',
    'GMAIL_CHECK_ACTIVE_CONNECTION': 'Checking Gmail Connection',
    'GMAIL_GET_REQUIRED_PARAMETERS': 'Getting Gmail Setup',
    'GMAIL_INITIATE_CONNECTION': 'Initiating Gmail Auth',
    'CALENDAR_CREATE_EVENT': 'Creating Calendar Event',
    'CALENDAR_GET_EVENTS': 'Retrieving Calendar Events',
    'CALENDAR_UPDATE_EVENT': 'Updating Calendar Event',
    'CALENDAR_DELETE_EVENT': 'Deleting Calendar Event',
    'CALENDAR_FIND_AVAILABLE_SLOTS': 'Finding Available Time Slots',
    'TASK_CREATE': 'Creating Task',
    'TASK_LIST': 'Retrieving Tasks',
    'TASK_UPDATE': 'Updating Task',
    'TASK_DELETE': 'Deleting Task',
    'TASK_MARK_COMPLETED': 'Completing Task',
    'TASK_SUMMARY': 'Analyzing Tasks',
    // Add more mappings as needed
  };
  
  // Return the mapped name if it exists, otherwise format the original name
  if (nameMap[name]) {
    return nameMap[name];
  }
  
  // Format the name by replacing underscores with spaces and capitalizing each word
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function CustomChatUI({
  instructions,
  labels = {
    title: "",
    initial: "How can I help you today?",
    placeholder: "Ask me anything...",
  },
  tokens,
}: CustomChatUIProps) {
  const {
    visibleMessages,
    appendMessage,
    setMessages,
    deleteMessage,
    reloadMessages,
    stopGeneration,
    isLoading,
  } = useCopilotChat({
    systemPrompt: instructions,
  } as UseCopilotChatOptions);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      appendMessage(
        new TextMessage({ content: inputValue.trim(), role: Role.User })
      );
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent new lines - catch all enter key combinations
    if (e.key === "Enter") {
      e.preventDefault();
      // Only send message if not shift+enter
      if (!e.shiftKey) {
        sendMessage();
      }
    }
  };

  // Handle auto-resizing of the textarea
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    // No need to resize height since we're using horizontal scrolling
    setInputValue(textarea.value);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Render different types of messages
  const renderMessage = (message: ChatMessage) => {
    // For debugging - log the message structure
    console.log("Message to render:", message);

    // Skip rendering for empty messages or certain message types we want to ignore
    if (!message || message.__typename === "AgentStateMessage") {
      return null;
    }

    // Check if message is a user message
    if (message.role === Role.User) {
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }

    // Check if it's a tool call message - return directly without the bubble wrapper
    const isToolCall = 
      message.__typename === "ActionExecutionMessage" || 
      (typeof message.id === 'string' && message.id.includes('call_')) ||
      message.__typename === "ResultMessage" || 
      (typeof message.id === 'string' && message.id.includes('result_')) ||
      message.toolCalls || 
      (message.name && message.args && message.status);

    // If it's a tool call, return the appropriate renderer directly
    if (isToolCall) {
      // Check ActionExecutionMessage type
      if (message.__typename === "ActionExecutionMessage" || 
          (typeof message.id === 'string' && message.id.includes('call_'))) {
        return (
          <ToolCallRenderer
            name={getDisplayName(message.name) || "Unknown Tool"}
            args={message.arguments || {}}
            status="running"
            result={null}
          />
        );
      }

      // Check ResultMessage type
      if (message.__typename === "ResultMessage" || 
          (typeof message.id === 'string' && message.id.includes('result_'))) {
        return (
          <ToolCallRenderer
            name={getDisplayName(message.actionName) || "Unknown Tool"}
            args={message.args || {}}
            status={message.result && message.result.error ? "error" : "success"}
            result={message.result || {}}
          />
        );
      }
      
      // Original tool call checks - for backward compatibility
      if (message.toolCalls && message.toolCalls.length > 0) {
        return (
          <div className="space-y-3">
            {message.toolCalls.map((toolCall: any, index: number) => (
              <ToolCallRenderer
                key={index}
                name={getDisplayName(toolCall.name) || "Unknown Tool"}
                args={toolCall.args || {}}
                status={toolCall.status || "unknown"}
                result={toolCall.result}
              />
            ))}
          </div>
        );
      }
      
      // Original tool call check - for backward compatibility
      if (message.name && message.args && message.status) {
        return (
          <ToolCallRenderer
            name={getDisplayName(message.name)}
            args={message.args}
            status={message.status}
            result={message.result}
          />
        );
      }
    }

    // Default for assistant text messages
    return message.content ? <Markdown content={message.content} /> : null;
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    const actionMap: Record<string, string> = {
      "schedule": "Schedule a meeting for me tomorrow at 2pm with the product team",
      "summarize": "Summarize my unread emails and show me what needs my attention",
      "reminder": "Set a reminder to call my client in 2 hours",
      "tasks": "Show me all my tasks due this week and help me prioritize them",
      "write": "Write an email to my team about the upcoming product launch"
    };

    if (actionMap[action]) {
      appendMessage(
        new TextMessage({ content: actionMap[action], role: Role.User })
      );
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header with Title Only */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center">
          <h2 className="text-lg font-light mr-4">{labels.title}</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={reloadMessages}
            className="p-2 rounded-full cursor-pointer hover:scale-105 hover:bg-white/10 transition-all duration-300"
            aria-label="Reload conversation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area - Chat View */}
      <div className="flex-1 overflow-y-auto p-4 overflow-x-hidden">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            {/* <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div> */}
            <h3 className="text-xl font-medium mb-2">{labels.initial}</h3>
            <p className="text-zinc-400 text-center max-w-md mb-8">I can help you manage emails, schedule events, track tasks, and more.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              <button 
                onClick={() => handleQuickAction("schedule")}
                className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <Calendar size={18} className="text-blue-400" />
                <span>Schedule a meeting</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction("summarize")}
                className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <Mail size={18} className="text-purple-400" />
                <span>Summarize my emails</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction("reminder")}
                className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <Clock size={18} className="text-green-400" />
                <span>Set a reminder</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction("tasks")}
                className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <CheckSquare size={18} className="text-amber-400" />
                <span>Manage my tasks</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {visibleMessages.map((message, index) => {
              // Cast message to ChatMessage type to fix TypeScript errors
              const msg = message as ChatMessage;
              
              // Check if it's a tool call message
              const isToolCall = 
                msg.__typename === "ActionExecutionMessage" || 
                (typeof msg.id === 'string' && msg.id.includes('call_')) ||
                msg.__typename === "ResultMessage" || 
                (typeof msg.id === 'string' && msg.id.includes('result_')) ||
                msg.toolCalls || 
                (msg.name && msg.args && msg.status);
              
              if (isToolCall) {
                // Render tool calls directly
                return (
                  <div key={index} className="my-2">
                    {renderMessage(msg)}
                  </div>
                );
              }
              
              // Render user and assistant messages
              const isUser = msg.role === Role.User;
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-xl py-2 px-3 max-w-4xl ${isUser ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white'}`}>
                    {renderMessage(msg)}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 relative">
        <div className="flex gap-2 items-center relative pr-12">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={autoResizeTextarea}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            className="w-full bg-transparent border-0 outline-none text-white p-3 resize-none overflow-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent max-h-32 rounded-xl"
            rows={1}
          />
          {isLoading ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                stopGeneration();
              }}
              className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
              aria-label="Stop generation"
            >
              <StopCircle size={26} />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-xl ${
                !inputValue.trim()
                  ? "bg-zinc-900 text-zinc-600 pointer-events-none"
                  : "text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              } transition-colors duration-300`}
              aria-label="Send message"
            >
              <ArrowUp size={26} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomChatUI;
