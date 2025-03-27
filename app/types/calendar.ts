export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  isAllDay: boolean;
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
  }[];
  htmlLink?: string;
  conferenceData?: {
    conferenceId: string;
    conferenceSolution: {
      name: string;
      key: {
        type: string;
      };
    };
    entryPoints: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
}

export interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  connected: boolean;
} 