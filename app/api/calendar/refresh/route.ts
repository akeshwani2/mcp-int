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
      return NextResponse.json({ 
        success: false, 
        message: 'No authentication tokens found',
        status: 'needs_gmail_auth',
        redirectUrl: '/api/gmail/auth?calendar=true&write=true' 
      });
    }

    // Parse tokens
    let tokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch (e) {
      console.error('Failed to parse token cookie:', e);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token format',
        status: 'invalid_token',
        redirectUrl: '/api/gmail/auth?calendar=true&write=true' 
      });
    }

    // Check if tokens include calendar access
    const hasReadAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar.readonly');
    const hasWriteAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar.events') || 
                          tokens.scope?.includes('https://www.googleapis.com/auth/calendar');
    
    if (!hasReadAccess) {
      return NextResponse.json({ 
        success: false, 
        message: 'Calendar read access not granted',
        status: 'needs_calendar_access',
        redirectUrl: '/api/gmail/auth?calendar=true'
      });
    }

    if (!hasWriteAccess) {
      return NextResponse.json({
        success: false,
        message: 'Calendar write access not granted',
        status: 'needs_calendar_write',
        redirectUrl: '/api/gmail/auth?calendar=true&write=true&force_refresh=true'
      });
    }

    // If token is expired, refresh it
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
      });

      const refreshResponse = await oauth2Client.refreshAccessToken();
      tokens = refreshResponse.credentials;

      // Save refreshed tokens
      cookieStore.set('gmail_tokens', JSON.stringify(tokens), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh tokens',
      redirectUrl: '/api/gmail/auth?calendar=true&write=true&force_refresh=true'
    });
  }
} 