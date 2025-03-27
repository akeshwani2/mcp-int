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
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('gmail_tokens');
    
    if (!tokensCookie) {
      return NextResponse.json({ 
        connected: false, 
        message: 'No tokens found' 
      });
    }

    // Parse tokens
    let tokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch (e) {
      console.error('Failed to parse token cookie:', e);
      return NextResponse.json({ 
        connected: false, 
        message: 'Invalid token format' 
      });
    }

    // Check if tokens include calendar access
    const hasCalendarAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar.readonly');
    
    if (!hasCalendarAccess) {
      return NextResponse.json({ 
        connected: false, 
        message: 'Calendar access not granted' 
      });
    }
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });
    
    // Test if we can access the calendar
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      // Just fetch a single calendar to verify access
      await calendar.calendarList.get({ calendarId: 'primary' });
      
      return NextResponse.json({ 
        connected: true, 
        message: 'Calendar access is working' 
      });
    } catch (error) {
      console.error('Calendar API test failed:', error);
      return NextResponse.json({ 
        connected: false, 
        message: 'Calendar API access failed' 
      });
    }
  } catch (error) {
    console.error('Calendar status check error:', error);
    return NextResponse.json({ 
      connected: false, 
      message: 'Error checking calendar status' 
    });
  }
} 