import { MCPProps } from './MCPCard';

// Placeholder icon URLs (using online placeholder services)
const ICONS = {
  googleSheets: 'https://placehold.co/64x64/22c55e/FFFFFF?text=GS',
  notion: 'https://placehold.co/64x64/000000/FFFFFF?text=N',
  github: 'https://placehold.co/64x64/24292e/FFFFFF?text=GH',
  slack: 'https://placehold.co/64x64/4A154B/FFFFFF?text=S',
  gmail: 'https://placehold.co/64x64/D44638/FFFFFF?text=G',
  discord: 'https://placehold.co/64x64/5865F2/FFFFFF?text=D',
  googleDocs: 'https://placehold.co/64x64/4285F4/FFFFFF?text=GD',
  linear: 'https://placehold.co/64x64/5E6AD2/FFFFFF?text=L',
  trello: 'https://placehold.co/64x64/0079BF/FFFFFF?text=T',
  asana: 'https://placehold.co/64x64/F06A6A/FFFFFF?text=A',
};

export const POPULAR_MCPS: MCPProps[] = [
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: ICONS.googleSheets,
    description: 'Google Sheets is a web-based spreadsheet application that allows you to create, edit, and collaborate on spreadsheets.',
    link: 'https://docs.google.com/'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: ICONS.notion,
    description: 'Notion centralizes notes, docs, wikis, and tasks in a single workspace for better team collaboration.',
    link: 'https://notion.so'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: ICONS.github,
    description: 'GitHub is a code hosting platform for version control and collaboration, making it easier to work together on projects.',
    link: 'https://github.com'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: ICONS.slack,
    description: 'Slack is a channel-based messaging platform. With Slack, people can work together more effectively.',
    link: 'https://slack.com'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: ICONS.gmail,
    description: 'Connect to Gmail to send and manage emails directly from your MCP platform.',
    link: 'https://mail.google.com'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: ICONS.discord,
    description: 'Discord is a VoIP and chat platform designed for creating communities and bringing people together.',
    link: 'https://discord.com'
  }
];

export const PRODUCTIVITY_MCPS: MCPProps[] = [
  {
    id: 'google-docs',
    name: 'Google Docs',
    icon: ICONS.googleDocs,
    description: 'Connect to Google Docs to perform various document editing and collaboration tasks.',
    link: 'https://docs.google.com/document/d/1234567890/edit?usp=sharing'
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: ICONS.linear,
    description: 'Connect to Linear to create and manage issues, projects, and workflows for your team.',
    link: 'https://linear.app'
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: ICONS.trello,
    description: 'Trello helps teams move work forward and collaborate with flexible boards, lists, and cards.',
    link: 'https://trello.com'
  },
  {
    id: 'asana',
    name: 'Asana',
    icon: ICONS.asana,
    description: 'Asana is the work management platform teams use to stay focused on goals, projects, and daily tasks.',
    link: 'https://asana.com'
  }
];

// Add more category-specific MCPs as needed 