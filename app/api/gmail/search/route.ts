import { NextRequest, NextResponse } from 'next/server';

// Define types for Gmail API responses
interface GmailMessage {
  id: string;
  threadId?: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailBodyPart {
  mimeType: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    data?: string;
    size?: number;
  };
  parts?: GmailBodyPart[];
}

interface GmailMessageDetails {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload: {
    headers: GmailHeader[];
    body?: {
      data?: string;
      size?: number;
    };
    parts?: GmailBodyPart[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, query, dateRange } = await request.json();
    
    if (!tokens || !tokens.access_token) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 });
    }
    
    // Construct Gmail API search query
    let searchQuery = query || '';
    
    // Add date range if provided
    if (dateRange) {
      if (dateRange.after) {
        searchQuery += ` after:${dateRange.after}`;
      }
      if (dateRange.before) {
        searchQuery += ` before:${dateRange.before}`;
      }
    }
    
    // Search emails using Gmail API
    const listResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=10`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );
    
    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      console.error('Gmail API error:', errorData);
      
      // Check if token expired
      if (errorData.error?.status === 'UNAUTHENTICATED' || errorData.error?.code === 401) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }
    
    const listData = await listResponse.json();
    
    // If no messages found
    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ emails: [] });
    }
    
    // Fetch details for each message
    const emailPromises = listData.messages.slice(0, 10).map(async (message: GmailMessage) => {
      const messageResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      
      if (!messageResponse.ok) {
        console.error(`Failed to fetch email ${message.id}`);
        return null;
      }
      
      const messageData = await messageResponse.json() as GmailMessageDetails;
      
      // Extract email details
      const headers = messageData.payload.headers;
      const from = headers.find((h: GmailHeader) => h.name === 'From')?.value || '';
      const to = headers.find((h: GmailHeader) => h.name === 'To')?.value || '';
      const subject = headers.find((h: GmailHeader) => h.name === 'Subject')?.value || '';
      const date = headers.find((h: GmailHeader) => h.name === 'Date')?.value || '';
      
      // Extract email body
      let body = '';
      let html = '';
      
      const extractBodyParts = (part: GmailBodyPart) => {
        if (part.body && part.body.data) {
          const content = Buffer.from(part.body.data, 'base64').toString('utf-8');
          if (part.mimeType === 'text/plain') {
            body = content;
          } else if (part.mimeType === 'text/html') {
            html = content;
          }
        }
        
        if (part.parts) {
          part.parts.forEach(extractBodyParts);
        }
      };
      
      if (messageData.payload.body && messageData.payload.body.data) {
        body = Buffer.from(messageData.payload.body.data, 'base64').toString('utf-8');
      }
      
      if (messageData.payload.parts) {
        messageData.payload.parts.forEach(extractBodyParts);
      }
      
      // Check for attachments
      const hasAttachments = messageData.payload.parts?.some((part: GmailBodyPart) => 
        part.filename && part.filename.length > 0
      ) || false;
      
      return {
        id: messageData.id,
        threadId: messageData.threadId,
        from,
        to,
        subject,
        date,
        snippet: messageData.snippet || '',
        body,
        html,
        hasAttachments,
        labels: messageData.labelIds || [],
      };
    });
    
    const emails = (await Promise.all(emailPromises)).filter(Boolean);
    
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 