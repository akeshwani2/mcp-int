"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink, RefreshCw } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  htmlLink?: string;
}

interface UpcomingEventsPanelProps {
  onAddEventClick?: () => void;
}

const UpcomingEventsPanel = ({ onAddEventClick }: UpcomingEventsPanelProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format time helper function
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date helper function
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Function to fetch calendar events
  const fetchCalendarEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to refresh the token
      const refreshResponse = await fetch('/api/calendar/refresh');
      await refreshResponse.json();
      
      // Now fetch calendar events
      const response = await fetch('/api/calendar/events');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar events: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.events && Array.isArray(data.events)) {
        // Convert API response to our CalendarEvent format
        const formattedEvents = data.events
          .filter((event: any) => event && Object.keys(event).length > 0)
          .map((event: any) => {
            // Handle different date formats from Google Calendar API
            let startTime, endTime;
            
            try {
              if (event.start?.dateTime) {
                startTime = new Date(event.start.dateTime);
              } else if (event.start?.date) {
                startTime = new Date(event.start.date + 'T00:00:00');
              } else {
                startTime = new Date();
              }
              
              if (event.end?.dateTime) {
                endTime = new Date(event.end.dateTime);
              } else if (event.end?.date) {
                endTime = new Date(event.end.date + 'T23:59:59');
              } else {
                endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
              }
            } catch (e) {
              return null;
            }
            
            return {
              id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: event.summary || 'Untitled Event',
              start_time: startTime,
              end_time: endTime,
              location: event.location || '',
              description: event.description || '',
              attendees: event.attendees?.map((a: any) => a.email || a.displayName) || [],
              htmlLink: event.htmlLink || ''
            };
          })
          .filter((event: any) => event !== null);
        
        // Sort events by start time
        const sortedEvents = formattedEvents.sort((a: CalendarEvent, b: CalendarEvent) => 
          a.start_time.getTime() - b.start_time.getTime()
        );
        
        // Only show upcoming events (today and future)
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const upcomingEvents = sortedEvents.filter((event: CalendarEvent) => 
          event.start_time >= now || event.end_time >= now
        );
        
        setEvents(upcomingEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      if (error instanceof Error) {
        setError(`Could not load calendar events: ${error.message}`);
      } else {
        setError('Could not load calendar events');
      }
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Group events by date
  const groupEventsByDate = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = event.start_time.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  // Load events on component mount
  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const groupedEvents = groupEventsByDate();

  return (
    <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Events
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchCalendarEvents}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400"
            aria-label="Refresh calendar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onAddEventClick && (
            <button
              onClick={onAddEventClick}
              className="flex items-center text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded transition-colors"
            >
              Add Event
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex space-x-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-zinc-400 text-sm">Loading events...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-zinc-400 text-sm mb-2">{error}</p>
          <button
            onClick={fetchCalendarEvents}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded border border-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <p className="text-zinc-400 text-sm mb-3">No upcoming events</p>
          <a 
            href="https://calendar.google.com/calendar/u/0/r/week" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            Open Google Calendar
          </a>
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {Object.keys(groupedEvents).map(dateKey => (
            <div key={dateKey}>
              <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                {formatDate(new Date(dateKey))}
              </div>
              
              <div className="space-y-3">
                {groupedEvents[dateKey].map(event => (
                  <div 
                    key={event.id}
                    className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-white text-sm mb-1">{event.title}</h5>
                      {event.htmlLink && (
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <div className="text-xs text-zinc-400 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees.length} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsPanel; 