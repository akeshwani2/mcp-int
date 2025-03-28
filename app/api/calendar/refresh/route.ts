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
        message: 'No tokens found',
        redirectUrl: '/api/gmail/auth?calendar=true'
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
        redirectUrl: '/api/gmail/auth?calendar=true'
      });
    }
    
    // Check for refresh token
    if (!tokens.refresh_token) {
      return NextResponse.json({ 
        success: false, 
        message: 'No refresh token available',
        redirectUrl: '/api/gmail/auth?calendar=true&prompt=consent'
      });
    }

    // Set credentials with the refresh token
    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token
    });
    
    // Use refresh token to get new tokens
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update stored tokens
      cookieStore.set('gmail_tokens', JSON.stringify(credentials), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      // Check if tokens include calendar access
      const hasCalendarAccess = credentials.scope?.includes('https://www.googleapis.com/auth/calendar.readonly');
      
      // Update calendar access cookie
      cookieStore.set('calendar_access', hasCalendarAccess ? 'true' : 'false', { 
        httpOnly: false, // Accessible via JavaScript
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Tokens refreshed successfully',
        hasCalendarAccess
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, we need to reauthenticate
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to refresh token',
        redirectUrl: '/api/gmail/auth?calendar=true&prompt=consent'
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error refreshing tokens',
      redirectUrl: '/api/gmail/auth?calendar=true'
    });
  }
} 