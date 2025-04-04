import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/gmail/callback'
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Handle error case
  if (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_rejected', request.url));
  }
  
  // If no code, redirect back to home with error
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in cookies that are accessible to client-side code
    const cookieStore = await cookies();
    
    // Set token cookie (NOT httpOnly to allow JavaScript access)
    cookieStore.set('gmail_tokens', JSON.stringify(tokens), {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    
    // Set a cookie that indicates auth status for the client
    cookieStore.set('gmail_connected', 'true', {
      httpOnly: false, // Accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    
    // Check if tokens include calendar access
    const hasCalendarAccess = tokens.scope?.includes('https://www.googleapis.com/auth/calendar.readonly');
    
    // Set a cookie for checking if calendar access is available
    cookieStore.set('calendar_access', hasCalendarAccess ? 'true' : 'false', { 
      httpOnly: false, // Accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    
    // Redirect to home page with success status
    return NextResponse.redirect(new URL('/?success=gmail_connected', request.url));
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange', request.url));
  }
} 