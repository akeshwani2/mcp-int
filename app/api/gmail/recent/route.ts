import { NextResponse } from 'next/server';
import { google, gmail_v1 } from 'googleapis';
import { cookies } from 'next/headers';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET() {
  try {
    // Get tokens from cookies
    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get('gmail_tokens');
    
    if (!tokensCookie) {
      return NextResponse.json({ error: 'No Gmail tokens found' }, { status: 401 });
    }

    // Parse tokens
    let tokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
    } catch (e) {
      console.error('Failed to parse token cookie:', e);
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get list of recent messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'in:inbox -in:spam -category:promotions -category:updates -category:social -category:forums' // Only show primary inbox emails
    });

    if (!response.data.messages) {
      return NextResponse.json({ emails: [] });
    }

    // Fetch full message details for each message
    const emails = await Promise.all(
      response.data.messages.map(async (message: gmail_v1.Schema$Message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id as string,
          format: 'full'
        });

        // Extract relevant information
        const headers = fullMessage.data.payload?.headers || [];
        const subject = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === 'subject')?.value || '';
        const from = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === 'from')?.value || '';
        const date = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === 'date')?.value || '';
        const to = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === 'to')?.value || '';

        // Extract body
        let body = '';
        let htmlBody = '';
        
        if (fullMessage.data.payload?.parts) {
          for (const part of fullMessage.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
            if (part.mimeType === 'text/html' && part.body?.data) {
              htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          }
        } else if (fullMessage.data.payload?.body?.data) {
          // For emails without parts
          const data = fullMessage.data.payload.body.data;
          body = Buffer.from(data, 'base64').toString('utf-8');
          if (fullMessage.data.payload.mimeType === 'text/html') {
            htmlBody = body;
          }
        }

        return {
          id: message.id,
          threadId: message.threadId,
          snippet: fullMessage.data.snippet,
          subject,
          from,
          date,
          to,
          body,
          html: htmlBody,
          labels: fullMessage.data.labelIds || []
        };
      })
    );

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve emails' }, { status: 500 });
  }
} 