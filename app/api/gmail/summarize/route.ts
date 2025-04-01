import { NextRequest, NextResponse } from 'next/server';

// Define email interface to replace any type
interface EmailData {
  subject: string;
  from?: string;
  snippet?: string;
  body?: string;
}

// Initialize Gemini API client
// We'll use fetch directly for the Gemini API

// Function to get a simple summary based on rules
const getSimpleSummary = (email: EmailData): string => {
  if (!email || !email.subject) return 'No subject';
  
  const subject = email.subject.toLowerCase();
  
  if (subject.includes('urgent') || 
      subject.includes('important') ||
      subject.includes('action required')) {
    return `URGENT: ${email.subject}`;
  } else if (subject.includes('meeting') || 
            subject.includes('calendar') ||
            subject.includes('invite')) {
    return `Meeting: ${email.subject}`;
  } else {
    // Simplify the subject by removing common prefixes
    return email.subject
      .replace(/^(RE:|FWD:|FW:)\s*/i, '')
      .trim();
  }
};

export async function POST(request: NextRequest) {
  try {
    const { email, useGemini = true } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email content is required' }, { status: 400 });
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Use Gemini if requested and API key is available
    if (useGemini && geminiApiKey) {
      try {
        // Combine email data for context
        const content = `
          Subject: ${email.subject}
          From: ${email.from}
          Snippet: ${email.snippet}
          Body: ${email.body?.substring(0, 500) || ''}
        `;
        
        // Call Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a very short summary (3-5 words max) for this email. Focus on the key action or information, keeping it brief and to the point:\n\n${content}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 20,
            }
          })
        });
        
        if (!response.ok) {
          console.error('Gemini API error:', await response.text());
          throw new Error('Failed to generate summary with Gemini');
        }
        
        const data = await response.json();
        
        // Extract summary from Gemini response
        const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text || email.subject;
        
        // Ensure summary is not too long (max 5 words)
        const words = summaryText.split(/\s+/);
        const finalSummary = words.length > 5 ? words.slice(0, 5).join(' ') : summaryText;
        
        return NextResponse.json({ summary: finalSummary });
      } catch (error) {
        console.error('Error with Gemini API:', error);
        // Fall back to rule-based summary
        return NextResponse.json({ summary: getSimpleSummary(email) });
      }
    } else {
      // Use rule-based summary when Gemini not available
      const summaryText = getSimpleSummary(email);
      return NextResponse.json({ summary: summaryText });
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
} 