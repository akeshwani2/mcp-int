import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback'
);

export async function POST(request: Request) {
  try {
    // Extract event data from request
    const eventData = await request.json();
    
    // Get tokens from cookies
    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get('gmail_tokens');
    
    if (!tokensCookie) {
      return NextResponse.json({ error: 'No tokens found' }, { status: 401 });
    }

    // Parse tokens
    let tokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch (e) {
      console.error('Failed to parse token cookie:', e);
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    // Check if tokens include calendar write access
    const hasCalendarAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar') || 
                             tokens.scope?.includes('https://www.googleapis.com/auth/calendar.events');
    
    if (!hasCalendarAccess) {
      // Redirect to get proper calendar write permissions
      return NextResponse.json({ 
        error: 'No calendar write access', 
        redirectUrl: '/api/gmail/auth?force_refresh=true&calendar=true&write=true'
      }, { status: 403 });
    }

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Structure the event properly
    const event: {
      summary: string;
      location?: string;
      description?: string;
      start: {
        dateTime: string;
        timeZone?: string;
      };
      end: {
        dateTime: string;
        timeZone?: string;
      };
      reminders: { useDefault: boolean };
      conferenceData?: {
        createRequest?: {
          conferenceSolutionKey?: {
            type: string;
          };
          requestId?: string;
        };
      };
    } = {
      summary: eventData.summary,
      location: eventData.location,
      description: eventData.description,
      start: eventData.start,
      end: eventData.end,
      reminders: {
        useDefault: true
      }
    };
    
    // Handle conference data if provided
    const hasConferenceData = eventData.conferenceData && 
                             eventData.conferenceData.createRequest && 
                             eventData.conferenceData.createRequest.conferenceSolutionKey;
    
    // Create the event
    const insertParams: {
      calendarId: string;
      requestBody: typeof event;
      conferenceDataVersion?: number;
    } = {
      calendarId: 'primary',
      requestBody: event
    };
    
    // If using Google Meet, we need to add the conferenceDataVersion parameter
    if (hasConferenceData) {
      insertParams.conferenceDataVersion = 1;
      event.conferenceData = eventData.conferenceData;
      
      // Log for debugging
      console.log('Creating event with conferenceData:', event.conferenceData);
    }
    
    const response = await calendar.events.insert(insertParams);

    // Log the created event to see the conferenceData created by Google
    if (response.data.conferenceData) {
      console.log('Google created conferenceData:', JSON.stringify(response.data.conferenceData, null, 2));
    }

    return NextResponse.json({ 
      success: true,
      event: response.data 
    });
  } catch (error: any) {
    console.error('Calendar API error:', error);
    
    // Check if the error is related to token/permissions
    if (error.code === 401 || error.code === 403) {
      return NextResponse.json({ 
        error: 'Authentication error. Please reconnect your calendar.',
        redirectUrl: '/api/gmail/auth?force_refresh=true&calendar=true&write=true'
      }, { status: error.code });
    }
    
    return NextResponse.json({ 
      error: `Failed to create calendar event: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
} 