"use client";

import { useCopilotChat, UseCopilotChatOptions } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Markdown } from "@copilotkit/react-ui";
import { ToolCallRenderer } from "./ToolCallRenderer";

interface CustomChatUIProps {
  instructions: string;
  labels?: {
    title: string;
    initial: string;
    placeholder: string;
  };
}

// Add this to eslint.config.mjs to suppress any type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChatMessage = any;

export function CustomChatUI({ 
  instructions,
  labels = {
    title: "MCP Assistant",
    initial: "Need any help?",
    placeholder: "Ask a question...",
  }
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
    systemPrompt: instructions
  } as UseCopilotChatOptions);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      appendMessage(new TextMessage({ content: inputValue.trim(), role: Role.User }));
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle auto-resizing of the textarea
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 96);
    textarea.style.height = `${newHeight}px`;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderMessage = (message: ChatMessage) => {
    // Check if message is a user message
    if (message.role === Role.User) {
      return (
        <div className="whitespace-pre-wrap">{message.content}</div>
      );
    } 
    
    // Check if message has tool call properties
    if (message.name && message.args && message.status) {
      return (
        <ToolCallRenderer
          name={message.name}
          args={message.args}
          status={message.status}
          result={message.result}
        />
      );
    }
    
    // Default for assistant text messages
    return <Markdown content={message.content} />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex justify-between items-center">
        <h2 className="text-lg font-light">{labels.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={reloadMessages}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {visibleMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">{labels.initial}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleMessages.map((message) => {
              // Cast message to ChatMessage type to fix TypeScript errors
              const msg = message as ChatMessage;
              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === Role.User ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.role === Role.User
                        ? "bg-white text-black"
                        : "bg-black text-white border border-white/10"
                    }`}
                  >
                    {renderMessage(msg)}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-4 bg-black text-white border border-white/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={autoResizeTextarea}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            className="w-full bg-black border border-white/20 rounded-lg py-3 pl-4 pr-12 resize-none text-white focus:outline-none focus:ring-1 focus:ring-white/30"
            rows={1}
            style={{ 
              minHeight: "48px",
              maxHeight: "96px"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              !inputValue.trim() || isLoading
                ? "text-white/30"
                : "text-white hover:bg-white/10"
            } transition-colors`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        {isLoading && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={stopGeneration}
              className="text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Stop generating
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 