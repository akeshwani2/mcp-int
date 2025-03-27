export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  html: string;
  type: string;
  importance: string;
  hasAttachments: boolean;
  labels: string[];
  aiSummary?: string;
  isSummaryLoading?: boolean;
} 