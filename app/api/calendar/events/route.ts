import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback'
);

export async function GET() {
  try {
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

    // Check if tokens include calendar access
    const hasCalendarAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar.readonly');
    if (!hasCalendarAccess) {
      return NextResponse.json({ error: 'No calendar access' }, { status: 403 });
    }

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get today's date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get date 7 days from now at the end of the day
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    // Fetch calendar events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: today.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 10
    });

    const events = response.data.items?.map(event => {
      // Instead of just passing the strings, pass the full objects with dateTime and date
      return {
        id: event.id,
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
        attendees: event.attendees,
        htmlLink: event.htmlLink,
        conferenceData: event.conferenceData
      };
    }) || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve calendar events' }, { status: 500 });
  }
} 