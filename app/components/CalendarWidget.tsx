"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Video, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { CalendarEvent, CalendarState } from '@/app/types/calendar';

interface CalendarWidgetProps {
  tokens: string | null;
}

export default function CalendarWidget({ tokens }: CalendarWidgetProps) {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    events: [],
    isLoading: false,
    error: null,
    connected: false
  });

  const fetchCalendarStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status');
      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('Failed to check calendar status:', error);
      return false;
    }
  };

  const fetchEvents = async () => {
    setCalendarState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // First check if calendar is connected
      const isConnected = await fetchCalendarStatus();
      
      if (!isConnected) {
        setCalendarState(prev => ({
          ...prev,
          isLoading: false,
          connected: false,
          error: 'Calendar is not connected'
        }));
        return;
      }
      
      // Fetch calendar events
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load calendar events');
      }
      
      setCalendarState({
        events: data.events,
        isLoading: false,
        error: null,
        connected: true
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setCalendarState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  // Handle reconnecting with calendar permissions
  const handleConnectCalendar = async () => {
    try {
      const response = await fetch('/api/gmail/auth');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  useEffect(() => {
    if (tokens) {
      fetchEvents();
    }
  }, [tokens]);

  // Format date to readable format
  const formatEventTime = (dateString: string, isAllDay: boolean) => {
    if (isAllDay) {
      return 'All day';
    }
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date nicely
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  // Group events by date
  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [date: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.start).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  const { events, isLoading, error, connected } = calendarState;
  const groupedEvents = groupEventsByDate(events);
  const dateKeys = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (!tokens) {
    return null;
  }

  if (!connected) {
    return (
      <div className="bg-black rounded-xl p-5 border border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-white" />
          <h4 className="text-lg font-medium text-white">Calendar Access</h4>
        </div>
        <div className="flex flex-col space-y-4">
          <p className="text-zinc-400 text-sm">
            To enable calendar-related features like checking your schedule, please connect your Google Calendar.
          </p>
          <div>
            <button
              onClick={handleConnectCalendar}
              className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors border border-zinc-700"
            >
              Connect Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-xl p-5 border border-zinc-800 h-full flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white" />
          <h4 className="text-lg font-medium text-white">Upcoming Meetings</h4>
        </div>
        <button 
          onClick={fetchEvents} 
          className="text-zinc-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-amber-400 mb-4 text-sm">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {events.length === 0 && !isLoading && !error ? (
        <p className="text-zinc-500 text-sm">No upcoming events in the next 7 days</p>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {dateKeys.map(dateKey => (
            <div key={dateKey} className="space-y-2">
              <h5 className="text-zinc-400 text-xs font-medium">
                {formatEventDate(dateKey)}
              </h5>
              
              <div className="space-y-2">
                {groupedEvents[dateKey].map(event => (
                  <div key={event.id} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h6 className="text-white text-sm font-medium">{event.summary}</h6>
                      {event.htmlLink && (
                        <a 
                          href={event.htmlLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mt-0.5 ml-1" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatEventTime(event.start, event.isAllDay)}
                        {!event.isAllDay && ` - ${formatEventTime(event.end, event.isAllDay)}`}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1 text-zinc-400 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {event.conferenceData && (
                      <div className="flex items-center gap-1 text-zinc-400 text-xs">
                        <Video className="w-3 h-3" />
                        <span>
                          {event.conferenceData.conferenceSolution.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 