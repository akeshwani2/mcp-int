"use client";

import React, { useState } from 'react';
import CalendarWidget from '../components/CalendarWidget';
import Sidebar from '../components/Sidebar';
import UpcomingEventsPanel from '../components/UpcomingEventsPanel';

const CalendarPage = () => {
  const [configOpen, setConfigOpen] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Function to handle opening the add event modal
  const handleAddEventClick = () => {
    setShowAddEvent(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar 
        onNavigate={() => {}}
        onConfigClick={() => setConfigOpen(!configOpen)}
        activeView="calendar"
      />

      {/* Main Content */}
      <div className="flex-1 ml-16 p-6">
        <h1 className="text-2xl font-bold mb-4"></h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar Section - Takes 65% of the space */}
          <div className="w-full md:w-2/3">
            <CalendarWidget 
              variant="full" 
              showAddEvent={showAddEvent}
              setShowAddEvent={setShowAddEvent}
            />
          </div>
          
          {/* Upcoming Meetings Section - Takes 35% of the space */}
          <div className="w-full md:w-1/3">
            <UpcomingEventsPanel onAddEventClick={handleAddEventClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;