"use client";

import React, { useState, useEffect } from 'react';
import CalendarWidget from '../components/CalendarWidget';
import Sidebar from '../components/Sidebar';
import UpcomingEventsPanel from '../components/UpcomingEventsPanel';
import { ServerTracker } from '../components/ServerTracker';
import { MCPConfigForm } from '../components/MCPConfigForm';
import OAuthRequiredModal from '../components/OAuthRequiredModal';
import { X } from 'lucide-react';

const CalendarPage = () => {
  const [configOpen, setConfigOpen] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Function to handle opening the add event modal
  const handleAddEventClick = () => {
    setShowAddEvent(true);
  };

  // Function that other components can call to open the auth modal
  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  // Pass this function to child components
  const handleConnectAccount = () => {
    setAuthModalOpen(true);
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only check if Gmail is authenticated
        const cookies = document.cookie.split(';').map(c => c.trim());
        const hasGmailToken = cookies.some(c => c.startsWith('gmail_tokens='));
        const isGmailConnected = cookies.some(c => c.startsWith('gmail_connected=true'));
        
        // Only show the modal if no Gmail auth at all
        if (!hasGmailToken && !isGmailConnected) {
          setAuthModalOpen(true);
        }
        // Skip calendar access check for now
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
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

        <div className='flex flex-col items-center justify-center mb-30'> 
        <h1 className="text-2xl font-bold mb-2">Your Calendar</h1>
        <p className='text-zinc-400 text-sm'>View your upcoming meetings and events</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar Section - Takes 65% of the space */}
          <div className="w-full md:w-2/3">
            <CalendarWidget 
              variant="full" 
              showAddEvent={showAddEvent}
              setShowAddEvent={setShowAddEvent}
              onConnectAccount={handleConnectAccount}
            />
          </div>
          
          {/* Upcoming Meetings Section - Takes 35% of the space */}
          <div className="w-full md:w-1/3">
            <UpcomingEventsPanel 
              onAddEventClick={handleAddEventClick} 
              onConnectAccount={handleConnectAccount}
            />
          </div>
        </div>
      </div>

      {/* Server config panel - Modal dialog */}
      {configOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl max-w-3xl w-full relative">
            <button 
              onClick={() => setConfigOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <MCPConfigForm />
          </div>
        </div>
      )}
      
      {/* OAuth Required Modal */}
      <OAuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        services={['gmail']}
      />
    </div>
  );
};

export default CalendarPage;