"use client";

import { useState, useEffect } from 'react';
import { Mail, Calendar, X } from 'lucide-react';

interface OAuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  services?: ('gmail' | 'calendar')[];
}

export default function OAuthRequiredModal({
  isOpen,
  onClose,
  services = ['gmail', 'calendar']
}: OAuthRequiredModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render on server
  if (!mounted) return null;
  
  // Don't render if modal is closed
  if (!isOpen) return null;
  
  const handleConnectServices = async () => {
    try {
      // Only request Gmail access by default, calendar is optional
      const response = await fetch('/api/gmail/auth');
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium">Connect Your Google Account</h2>
            <p className="text-zinc-400 text-sm">Enhance Echo's capabilities</p>
          </div>
        </div>
        
        <p className="text-zinc-300 mb-6">
          To access this feature, you need to connect your Google account to Echo. 
          This will allow Echo to access your Gmail and optionally your Calendar.
        </p>
        
        <div className="space-y-3 mb-6">
          {services.includes('gmail') && (
            <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
              <Mail size={18} className="text-purple-400" />
              <span className="text-zinc-300">Access to Gmail</span>
            </div>
          )}
          
          {services.includes('calendar') && (
            <div className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
              <Calendar size={18} className="text-blue-400" />
              <span className="text-zinc-300">Access to Calendar</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-zinc-700 text-white hover:bg-zinc-800 transition-colors"
          >
            Not Now
          </button>
          
          <button
            onClick={handleConnectServices}
            className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Connect Services
          </button>
        </div>
      </div>
    </div>
  );
} 