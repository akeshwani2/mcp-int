"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  description?: string;
  attendees?: string[];
  htmlLink?: string;
  conferenceData?: {
    conferenceUrl?: string;
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
}

interface CalendarWidgetProps {
  tokens?: string | null;
  variant?: 'compact' | 'full'; // compact for email dashboard, full for calendar tab
  showAddEvent?: boolean;
  setShowAddEvent?: React.Dispatch<React.SetStateAction<boolean>>;
  onConnectAccount?: () => void;
}

export default function CalendarWidget({ 
  tokens, 
  variant = 'compact', 
  showAddEvent: externalShowAddEvent,
  setShowAddEvent: externalSetShowAddEvent,
  onConnectAccount 
}: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [internalShowAddEvent, setInternalShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent> & { meetingType?: 'none' | 'zoom' | 'meet' }>({
    title: '',
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
    meetingType: 'none'
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  
  // Use either external state (if provided) or internal state
  const showAddEventValue = externalShowAddEvent !== undefined ? externalShowAddEvent : internalShowAddEvent;
  const setShowAddEventValue = externalSetShowAddEvent || setInternalShowAddEvent;
  
  // Function to refresh calendar data via token refresh if needed
  const refreshCalendarEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to refresh the token
      const refreshResponse = await fetch('/api/calendar/refresh');
      const refreshData = await refreshResponse.json();
      
      console.log('Token refresh result:', refreshData);
      
      if (!refreshData.success && refreshData.redirectUrl) {
        // Instead of direct redirect, set error message so parent component can handle this
        setError('Calendar authentication required. Please connect your Google account to use this feature.');
        return;
      }
      
      // Now fetch calendar events with potentially refreshed token
      console.log('Fetching calendar events after token refresh...');
      const response = await fetch('/api/calendar/events');
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required. Please connect your Google account to use the calendar feature.');
          return;
        }
        console.error('Calendar API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch calendar events: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Calendar API response raw:', data);
      
      if (data.error) {
        console.error('Calendar API returned error:', data.error);
        throw new Error(data.error);
      }
      
      if (data.events && Array.isArray(data.events)) {
        // Before mapping, log a sample event to see structure
        if (data.events.length > 0) {
          console.log('Sample event from API:', JSON.stringify(data.events[0], null, 2));
        }
        
        // Convert API response to our CalendarEvent format
        const formattedEvents = data.events
          .filter((event: any) => {
            // Skip events that are completely empty or undefined
            if (!event || (Object.keys(event).length === 0)) {
              console.log('Skipping empty event object');
              return false;
            }
            return true;
          })
          .map((event: any) => {
            // Add debug logging
            console.log('Processing event:', event);
            
            // Handle different date formats from Google Calendar API
            let startTime, endTime;
            
            try {
              // Only continue if we have at least some data to work with
              if (!event.start && !event.end) {
                console.error('Event missing both start and end times:', event);
                return null; // Will be filtered out below
              }
              
              if (event.start?.dateTime) {
                // If it's a timed event
                startTime = new Date(event.start.dateTime);
                console.log('Parsed start time from dateTime:', startTime);
              } else if (event.start?.date) {
                // If it's an all-day event
                startTime = new Date(event.start.date + 'T00:00:00');
                console.log('Parsed start time from date:', startTime);
              } else {
                // Fallback - using the current time or end time if available
                console.warn('Event missing start time, using fallback:', event);
                
                if (event.end?.dateTime) {
                  // If we have an end time, set start time to 1 hour before
                  const endDate = new Date(event.end.dateTime);
                  startTime = new Date(endDate.getTime() - 60 * 60 * 1000);
                } else if (event.end?.date) {
                  // If we have an end date, set start time to beginning of that day
                  startTime = new Date(event.end.date + 'T00:00:00');
                } else {
                  // No good time information at all, use current time
                  startTime = new Date();
                }
              }
              
              if (event.end?.dateTime) {
                endTime = new Date(event.end.dateTime);
                console.log('Parsed end time from dateTime:', endTime);
              } else if (event.end?.date) {
                endTime = new Date(event.end.date + 'T23:59:59');
                console.log('Parsed end time from date:', endTime);
              } else {
                // Fallback - setting end time to 1 hour after start
                console.warn('Event missing end time, using fallback:', event);
                endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
              }
            } catch (e) {
              console.error('Error parsing event dates:', e, event);
              return null; // Will be filtered out below
            }
            
            return {
              id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: event.summary || 'Untitled Event',
              start_time: startTime,
              end_time: endTime,
              location: event.location || '',
              description: event.description || '',
              attendees: event.attendees?.map((a: any) => a.email || a.displayName) || [],
              htmlLink: event.htmlLink || '',
              conferenceData: event.conferenceData || undefined
            };
          })
          .filter((event: any) => event !== null); // Remove any events that returned null during processing
        
        console.log(`Formatted ${formattedEvents.length} calendar events:`, formattedEvents);
        
        // Check if we have valid upcoming events - should be in the future
        const now = new Date();
        const futureEvents = formattedEvents.filter((event: any) => 
          event.start_time > now || 
          (event.end_time && event.end_time > now)
        );
        
        console.log(`Found ${futureEvents.length} future events`);
        setEvents(formattedEvents);
      } else {
        // No events from API
        console.log('No events returned from Calendar API');
        setEvents([]);
      }
    } catch (error) {
      console.error('Error refreshing calendar events:', error);
      if (error instanceof Error) {
        setError(`Could not load calendar events: ${error.message}. Please check your calendar connection.`);
      } else {
        setError('Could not load calendar events. Please check your calendar connection.');
      }
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Use our refresh function on initial load
    refreshCalendarEvents();
  }, [tokens]);
  
  // Force token refresh on first load
  useEffect(() => {
    // Immediately try to refresh the token to ensure we have the latest
    fetch('/api/calendar/refresh')
      .then(response => response.json())
      .then(data => {
        console.log('Token refresh on mount:', data);
        // Don't redirect automatically, just set an error message if needed
        if (!data.success) {
          setError('Calendar authentication required. Please connect your Google account to use this feature.');
        }
      })
      .catch(err => {
        console.error('Error refreshing token on mount:', err);
      });
  }, []);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    a.start_time.getTime() - b.start_time.getTime()
  );
  
  // For debugging
  console.log('Sorted events for display:', sortedEvents.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start_time.toISOString(),
    end: e.end_time.toISOString(),
    isUpcoming: e.end_time >= new Date()
  })));
  
  // Get upcoming events for the compact view
  const now = new Date();
  console.log('Current time for comparison:', now.toISOString());
  
  const upcomingEvents = sortedEvents
    .filter((event: CalendarEvent) => {
      const isUpcoming = event.end_time >= now;
      console.log(`Event "${event.title}" end time: ${event.end_time.toISOString()}, is upcoming: ${isUpcoming}`);
      return isUpcoming;
    })
    .slice(0, 5);
  
  // Generate a meeting link based on the selected type
  const generateMeetingLink = async (type: 'zoom' | 'meet') => {
    if (type === 'meet') {
      // Google Meet links are simple to generate client-side
      const randomId = Math.random().toString(36).substring(2, 12);
      return `https://meet.google.com/${randomId}`;
    } else if (type === 'zoom') {
      try {
        // Call our Zoom API endpoint to create a meeting
        const response = await fetch('/api/calendar/create-zoom-meeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newEvent.title,
            start_time: newEvent.start_time?.toISOString(),
            duration: newEvent.end_time && newEvent.start_time ? 
              Math.ceil((newEvent.end_time.getTime() - newEvent.start_time.getTime()) / (60 * 1000)) : 60
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create Zoom meeting');
        }
        
        const data = await response.json();
        console.log('Zoom meeting created:', data);
        
        if (data.success && data.meeting && data.meeting.join_url) {
          return data.meeting.join_url;
        } else {
          throw new Error('Invalid Zoom meeting response');
        }
      } catch (error) {
        console.error('Error generating Zoom link:', error);
        // Fallback to a placeholder link if the API call fails
        const randomId = Math.random().toString(36).substring(2, 10);
        return `https://zoom.us/j/${randomId}`;
      }
    }
    return '';
  };

  // Add a new event
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare event data
      let location = newEvent.location || '';
      let conferenceData = undefined;
      
      if (newEvent.meetingType && newEvent.meetingType !== 'none') {
        if (newEvent.meetingType === 'meet') {
          // For Google Meet, use the conferenceData API
          conferenceData = {
            createRequest: {
              requestId: Math.random().toString(36).substring(2, 12),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          };
          // Clear location to ensure it doesn't conflict with conferenceData
          location = '';
        } else if (newEvent.meetingType === 'zoom') {
          // For Zoom, generate a link and set it as location
          const meetingLink = await generateMeetingLink('zoom');
          location = meetingLink;
        }
      }
      
      // Format the dates for the API
      const formattedEvent = {
        summary: newEvent.title,
        location: location,
        description: newEvent.description || '',
        start: {
          dateTime: newEvent.start_time.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: newEvent.end_time.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        conferenceData: conferenceData
      };
      
      // Call the API to create the event
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedEvent)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if we need to redirect for authentication
        if (errorData.redirectUrl) {
          window.location.href = errorData.redirectUrl;
          return;
        }
        
        throw new Error(errorData.error || `Failed to create event: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Event created:', data);
      
      // Add additional console log to inspect conferenceData
      if (data.event?.conferenceData) {
        console.log('Created event conference data:', data.event.conferenceData);
      }
      
      // Refresh events to show the new one
      await refreshCalendarEvents();
      
      // Close modal and reset form
      setShowAddEventValue(false);
      setNewEvent({
        title: '',
        start_time: new Date(),
        end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
        meetingType: 'none'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Could not create the event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Calendar navigation functions for the full view
  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Calendar grid helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const getEventsForDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      return eventStart >= date && eventStart < nextDate;
    });
  };
  
  // Group events by date for better visualization in compact view
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  sortedEvents.forEach(event => {
    const dateKey = event.start_time.toDateString();
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });
  
  // Helper to detect meeting links and get the correct URL
  const getMeetingType = (event: CalendarEvent) => {
    // First check conferenceData for Google Meet
    if (event.conferenceData) {
      // If there are video entry points, use the first one
      const videoEntryPoint = event.conferenceData.entryPoints?.find(
        (e: any) => e.entryPointType === 'video'
      );
      
      if (videoEntryPoint?.uri) {
        if (videoEntryPoint.uri.includes('meet.google.com')) {
          return { type: 'meet', url: videoEntryPoint.uri };
        }
      }
      
      // If no video entry points, check for conferenceUrl
      if (event.conferenceData.conferenceUrl) {
        if (event.conferenceData.conferenceUrl.includes('meet.google.com')) {
          return { type: 'meet', url: event.conferenceData.conferenceUrl };
        }
      }
    }
    
    // Fall back to location check
    if (event.location) {
      if (event.location.includes('meet.google.com')) {
        return { type: 'meet', url: event.location };
      } else if (event.location.includes('zoom.us')) {
        return { type: 'zoom', url: event.location };
      }
    }
    
    return null;
  };
  
  // Render the calendar grid for the full view
  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 p-1 border border-zinc-800 bg-zinc-900/30"></div>);
    }
    
    // Add cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year;
      
      const dayEvents = getEventsForDate(year, month, day);
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-20 p-1 border border-zinc-800 transition-colors overflow-hidden ${
            isToday ? 'bg-blue-900/20 border-blue-500' : hasEvents ? 'bg-zinc-800/30' : 'bg-zinc-900/30'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full' : ''}`}>
              {day}
            </span>
            {hasEvents && !isToday && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            )}
          </div>
          <div className="mt-1 space-y-1 overflow-hidden max-h-14">
            {dayEvents.slice(0, 2).map(event => {
              // Check if the event has a virtual meeting
              const meetingInfo = getMeetingType(event);
              // const meetingIcon = meetingInfo ? 
              //   (meetingInfo.type === 'meet' ? '🎦 ' : '👥 ') : '';

              return (
                <div key={event.id} className={`text-xs ${meetingInfo ? 'bg-indigo-900/40 text-indigo-300' : 'bg-blue-900/30 text-blue-300'} px-1 py-0.5 rounded truncate`}>
                  {formatTime(event.start_time)} {event.title}
                </div>
              );
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-zinc-400 text-center">+{dayEvents.length - 2}</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-zinc-400 p-1">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };
  
  // Render the compact view
  if (variant === 'compact') {
    return (
      <div className="bg-black rounded-xl p-5 border border-zinc-800 h-full flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-white" />
            <h4 className="text-lg font-medium text-white">Upcoming Events</h4>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refreshCalendarEvents}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddEventValue(true)}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
            >
              Add Event
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex space-x-2 mb-4">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-zinc-400 text-sm">Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-zinc-400 text-sm mb-2">{error}</p>
            <div className="flex space-x-2">
              <button
                onClick={refreshCalendarEvents}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  const cookies = document.cookie.split(';').map(c => c.trim());
                  const isGmailConnected = cookies.some(c => c.startsWith('gmail_connected=true'));
                  
                  // Only redirect to auth if Gmail isn't connected
                  if (!isGmailConnected) {
                    if (onConnectAccount) {
                      onConnectAccount();
                    } else {
                      window.location.href = '/api/gmail/auth';
                    }
                  } else {
                    // Just retry if Gmail is connected but calendar isn't
                    refreshCalendarEvents();
                  }
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
              >
                Connect Google Account
              </button>
            </div>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="text-zinc-500 text-sm mb-2">No upcoming events found in your calendar</p>
            <div className="flex flex-col space-y-2 items-center">
              <button
                onClick={refreshCalendarEvents}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Refresh Calendar
              </button>
              <a 
                href="https://calendar.google.com/calendar/u/0/r/week" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                Open Google Calendar
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1">
            {Object.keys(groupedEvents).map(dateKey => (
              <div key={dateKey} className="mb-4">
                <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                  {formatDate(new Date(dateKey))}
                </div>
                
                <div className="space-y-2">
                  {groupedEvents[dateKey].map(event => {
                    // Determine if this event has a virtual meeting
                    const meetingInfo = getMeetingType(event);
                    const isVirtualMeeting = !!meetingInfo;
                    
                    return (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-white text-sm mb-1">
                            {/* {isVirtualMeeting && (
                              <span className="mr-1">{meetingInfo.type === 'meet' ? '🎦' : '👥'}</span>
                            )} */}
                            {event.title}
                          </h5>
                          {event.htmlLink && (
                            <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        
                        <div className="text-xs text-zinc-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </span>
                          </div>
                          
                          {isVirtualMeeting ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              <a 
                                href={meetingInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center"
                              >
                                {meetingInfo.type === 'meet' ? 'Google Meet' : 'Zoom'} Meeting
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          ) : event.location ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          ) : null}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              <span>{Array.isArray(event.attendees) ? event.attendees.length : 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Event Modal - Same for both variants */}
        {showAddEventValue && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-lg p-5 max-w-md w-full border border-zinc-700">
              <h3 className="text-lg font-medium mb-4">Add New Event</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    placeholder="Event title"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Start</label>
                    <input
                      type="datetime-local"
                      value={newEvent.start_time ? new Date(newEvent.start_time.getTime() - newEvent.start_time.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewEvent({...newEvent, start_time: new Date(e.target.value)})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">End</label>
                    <input
                      type="datetime-local"
                      value={newEvent.end_time ? new Date(newEvent.end_time.getTime() - newEvent.end_time.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewEvent({...newEvent, end_time: new Date(e.target.value)})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Meeting Type</label>
                  <select 
                    value={newEvent.meetingType || 'none'} 
                    onChange={(e) => setNewEvent({...newEvent, meetingType: e.target.value as 'none' | 'zoom' | 'meet'})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    disabled={isSaving}
                  >
                    <option value="none">No virtual meeting</option>
                    <option value="meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                  </select>
                  {newEvent.meetingType !== 'none' && (
                    <p className="text-xs text-zinc-500 mt-1">
                      A {newEvent.meetingType === 'meet' ? 'Google Meet' : 'Zoom'} link will be generated automatically.
                    </p>
                  )}
                </div>
                
                {newEvent.meetingType === 'none' && (
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Location (optional)</label>
                    <input
                      type="text"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                      placeholder="Location"
                      disabled={isSaving}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddEventValue(false)}
                    className="px-4 py-2 text-zinc-300 hover:text-white"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEvent}
                    className={`px-4 py-2 ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} rounded-md text-white transition-colors flex items-center`}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </>
                    ) : 'Add Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render the full calendar view
  return (
    <div className="bg-black rounded-xl p-4 border border-zinc-800 h-full flex flex-col overflow-hidden">
      {/* Header with month navigation */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white" />
          <h4 className="text-lg font-medium text-white">Calendar</h4>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-zinc-800"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-base font-medium mx-2 min-w-20 text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-zinc-800"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={refreshCalendarEvents}
              className="flex items-center text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </button>
            
            {/* <button
              onClick={() => setShowAddEventValue(true)}
              className="flex items-center text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Event
            </button> */}
          </div>
        </div>
      </div>
      
      {/* Calendar Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex space-x-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-zinc-400 text-sm">Loading calendar...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p className="text-zinc-400 text-sm mb-4">Calendar authentication required. Please connect your Google account to use this feature.</p>
          <div className="flex space-x-2">
            <button
              onClick={refreshCalendarEvents}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                if (onConnectAccount) {
                  onConnectAccount();
                }
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
            >
              Connect Google Account
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1">
          {renderCalendarGrid()}
          
          {/* Hide Upcoming Events Section in full variant since we have a dedicated panel */}
          {variant === 'full' ? null : (
            <div className="mt-6">
              <h3 className="text-base font-medium mb-3">Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                  <p className="text-zinc-500 text-sm mb-2">No upcoming events found in your calendar</p>
                  <div className="flex justify-center">
                    <a 
                      href="https://calendar.google.com/calendar/u/0/r/week" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Open Google Calendar
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    // Determine if this event has a virtual meeting
                    const meetingInfo = getMeetingType(event);
                    const isVirtualMeeting = !!meetingInfo;
                    
                    return (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-white text-sm mb-1">
                            {/* {isVirtualMeeting && (
                              <span className="mr-1">{meetingInfo.type === 'meet' ? '🎦' : '👥'}</span>
                            )} */}
                            {event.title}
                          </h5>
                          {event.htmlLink && (
                            <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        
                        <div className="text-xs text-zinc-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDate(event.start_time)} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </span>
                          </div>
                          
                          {isVirtualMeeting ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              <a 
                                href={meetingInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center"
                              >
                                {meetingInfo.type === 'meet' ? 'Google Meet' : 'Zoom'} Meeting
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          ) : event.location ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          ) : null}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              <span>{Array.isArray(event.attendees) ? event.attendees.length : 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Add Event Modal - Same for both variants */}
      {showAddEventValue && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-5 max-w-md w-full border border-zinc-700">
            <h3 className="text-lg font-medium mb-4">Add New Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  placeholder="Event title"
                  disabled={isSaving}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_time ? new Date(newEvent.start_time.getTime() - newEvent.start_time.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewEvent({...newEvent, start_time: new Date(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_time ? new Date(newEvent.end_time.getTime() - newEvent.end_time.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewEvent({...newEvent, end_time: new Date(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Meeting Type</label>
                <select 
                  value={newEvent.meetingType || 'none'} 
                  onChange={(e) => setNewEvent({...newEvent, meetingType: e.target.value as 'none' | 'zoom' | 'meet'})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  disabled={isSaving}
                >
                  <option value="none">No virtual meeting</option>
                  <option value="meet">Google Meet</option>
                </select>
                {newEvent.meetingType !== 'none' && (
                  <p className="text-xs text-zinc-500 mt-1">
                    A {newEvent.meetingType === 'meet' ? 'Google Meet' : 'Zoom'} link will be generated automatically.
                  </p>
                )}
              </div>
              
              {newEvent.meetingType === 'none' && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Location (optional)</label>
                  <input
                    type="text"
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                    placeholder="Location"
                    disabled={isSaving}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddEventValue(false)}
                  className="px-4 py-2 text-zinc-300 hover:text-white"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={addEvent}
                  className={`px-4 py-2 ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} rounded-md text-white transition-colors flex items-center`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : 'Add Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 