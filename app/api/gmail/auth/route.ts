import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback'
);

export async function GET(request: NextRequest) {
  try {
    // Check query parameters
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('force_refresh') === 'true';
    const includeCalendar = searchParams.get('calendar') === 'true';
    const calendarWrite = searchParams.get('write') === 'true';
    
    // Base scopes for Gmail
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
    ];
    
    // Add calendar scopes if requested
    if (includeCalendar) {
      // Always include readonly scope
      scopes.push('https://www.googleapis.com/auth/calendar.readonly');
      
      // Add write scope if requested
      if (calendarWrite) {
        scopes.push('https://www.googleapis.com/auth/calendar.events');
      }
    }
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: forceRefresh ? 'consent' : undefined,
      include_granted_scopes: true,
    });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
} 