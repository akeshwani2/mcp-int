import { MCPProps } from './MCPCard';

// Placeholder icon URLs (using online placeholder services)
const ICONS = {
  googleSheets: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google-sheets.svg',
  notion: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/notion.svg',
  github: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/github.png',
  slack: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/slack.svg',
  gmail: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/gmail.svg',
  discord: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/discord.svg',
  drive: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google-drive.svg',
  linear: '/images/marketplace/linear.png',
  asana: '/images/marketplace/asana.png',
  pagerduty: '/images/marketplace/pagerduty.png',
  neon: '/images/marketplace/neon.png',
  zenrows: '/images/marketplace/zenrows.png',
  sentry: '/images/marketplace/sentry.png',
  supabase: '/images/marketplace/supabase.png',
  bitbucket: '/images/marketplace/bitbucket.png',
  googleMaps: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google_maps.jpeg',
  weathermap: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/weathermap.png',
  hackernews: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/hackernews.png',
  foursquare: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/foursquare.png',
  you: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//you.webp',
  linkup: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/linkup.jpeg',
  browserBase: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//browser-base.jpeg',
  google: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google.svg',
  oneDrive: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/one-drive.svg',
  docusign: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/docusign.svg',
  googlePhotos: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/Google_Photos.png',
  dropbox: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/dropbox.svg',
  canva: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/canva.jpeg',
  figma: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/figma.svg',
  airtable: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/airtable.svg',
  shortcut: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//shortcut.svg',
  onepage: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/onepage.svg',
  wrike: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/wrike.png',
  monday: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//monday.png',
  googleTasks: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//google-tasks.png',
  googleDocsNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google-docs.svg',
  rocketlane: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/rocketlane.png',
  clickup: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/clickup.png',
  linearNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/linear.png',
  coda: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/coda.png',
  codeInterpreter: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//code-interpreter.webp',
  neonNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/neon.png',
  pagerdutyNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/pagerduty.png',
  sentryNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/sentry.svg',
  zenrowsNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/zenrows.jpeg',
  bitbucketNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/bitbucket.svg',
  supabaseNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/supabase.jpeg',
  semanticscholar: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/semanticscholar.png',
  composio: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//composio-logo.png',
  perplexity: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//perplexity.jpeg',
  mem0: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//mem0.png',
  texttopdf: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/texttopdf.png',
  lmnt: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/lmnt_logo.jpeg',
  typefully: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/typefully.png',
  entelligence: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/entelligence.png',
  sharepoint: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/sharepoint-icon.svg',
  dialpad: 'https://assets.dialpad.com/dialpad_logo.svg',
  zoom: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/zoom.svg',
  googleMeet: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google-meet.webp',
  outlook: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/Outlook%20SVG%20Icon.svg',
  retellai: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/retellai.jpeg',
  microsoftTeams: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//microsoft-teams-logo.jpeg',
  youtube: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/youtube.svg',
  jira: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/jira.svg',
  trelloNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/trello.svg',
  bolna: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/bolna-logo.png',
  asanaNew: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//asana.png',
  borneo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/borneo.jpeg',
  microsoftClarity: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//microsoft-clarity-logo.jpeg',
  pdl: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/pdl.png',
  googleBigQuery: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/googl-bigquery.svg',
  exa: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//exa.png',
  servicenow: 'https://raw.githubusercontent.com/ComposioHQ/open-logos/refs/heads/master/servicenow.png',
  amplitude: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//amplitude.svg',
  posthog: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/posthog.svg',
  mixpanel: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/mixpanel.svg',
  tavily: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/tavily.svg',
  firecrawl: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/firecrawl.jpeg',
  serpapi: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//serpapi.png',
  snowflake: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/snowflake.svg',
  fireflies: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/fireflies.jpg',
  mailchimp: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/mailchimp.svg',
  klaviyo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//klaviyo.png',
  sendgrid: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/sendgrid.png',
  brevo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//brevo-logo.jpg',
  twitter: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/twitter.png',
  ahrefs: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/ahrefs.png',
  linkedin: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/linkedin.svg',
  reddit: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/reddit.svg',
  crustdata: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/crustdata.png',
  recall: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/recall.svg',
  stripe: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/stripe.jpeg',
  cal: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//cal-logo.png',
  calendly: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/calendly.svg',
  apaleo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/apaleo.png',
  googleCalendar: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google-calendar.svg',
  zendesk: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/zendesk.svg',
  gorgias: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//gorgias.png',
  acculynx: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/acculynx.jpeg',
  freshdesk: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/freshdesk.svg',
  zoho: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/zoho.png',
  agencyzoom: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/agencyzoom_logo.jpeg',
  kommo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/kommo.png',
  pipedrive: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/pipedrive.svg',
  salesforce: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/salesforce.svg',
  hubspot: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master//hubspot.webp',
  intercom: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/intercom.svg',
  dynamics365: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/Dynamics%20365%20Icon.svg',
  apollo: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/apollo.jpg',
  affinity: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/affinity.jpeg',
  shopify: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/shopify.svg',
  junglescout: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/junglescout.jpeg',
  canvas: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/canvas.jpeg',
  d2lbrightspace: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/d2lbrightspace.png',
  binance: 'https://cdn.brandfetch.io/id-pjrLx_q/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B',
  coinbase: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/coinbase.svg',
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
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: ICONS.drive,
    description: 'Google Drive is a cloud storage service that allows you to store and share files online.',
    link: 'https://drive.google.com'
  }
];

export const PRODUCTIVITY_MCPS: MCPProps[] = [
  {
    id: 'google-docs',
    name: 'Google Docs',
    icon: ICONS.googleDocsNew,
    description: 'Connect to Google Docs to perform various document editing and collaboration tasks.',
    link: 'https://docs.google.com/document/d/1234567890/edit?usp=sharing'
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: ICONS.linearNew,
    description: 'Connect to Linear to create and manage issues, projects, and workflows for your team.',
    link: 'https://linear.app'
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: ICONS.trelloNew,
    description: 'Trello helps teams move work forward and collaborate with flexible boards, lists, and cards.',
    link: 'https://trello.com'
  },
  {
    id: 'asana',
    name: 'Asana',
    icon: ICONS.asanaNew,
    description: 'Asana is the work management platform teams use to stay focused on goals, projects, and daily tasks.',
    link: 'https://asana.com'
  }
];

export const DEVELOPER_TOOLS_MCPS: MCPProps[] = [
  {
    id: 'pagerduty',
    name: 'Pagerduty',
    icon: ICONS.pagerdutyNew,
    description: 'Integrate PagerDuty to manage incidents, alerts, and on-call rotations for your services.',
    link: 'https://pagerduty.com'
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: ICONS.neonNew,
    description: 'Postgres, on a serverless platform designed for modern applications.',
    link: 'https://neon.tech'
  },
  {
    id: 'zenrows',
    name: 'Zenrows',
    icon: ICONS.zenrowsNew,
    description: 'Connect to ZenRows to effortlessly scrape and extract data from websites.',
    link: 'https://zenrows.com'
  },
  {
    id: 'sentry',
    name: 'Sentry',
    icon: ICONS.sentryNew,
    description: 'Integrate Sentry to manage your error tracking and application monitoring.',
    link: 'https://sentry.io'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    icon: ICONS.supabaseNew,
    description: 'Supabase is an open-source backend-as-a-service that provides all the backend features you need.',
    link: 'https://supabase.io'
  },
  {
    id: 'codeinterpreter',
    name: 'Codeinterpreter',
    icon: ICONS.codeInterpreter,
    description: 'CodeInterpreter extends Python-based development environments with advanced code analysis.',
    link: 'https://codeinterpreter.com'
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: ICONS.bitbucketNew,
    description: 'Bitbucket is a Git-based code hosting and collaboration tool for teams.',
    link: 'https://bitbucket.org'
  }
];

export const MARKETING_SOCIAL_MCPS: MCPProps[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: ICONS.mailchimp,
    description: 'Email marketing platform for managing campaigns, subscribers, and marketing automation.',
    link: 'https://mailchimp.com'
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    icon: ICONS.klaviyo,
    description: 'Marketing automation platform for email marketing, SMS marketing, and targeted ads.',
    link: 'https://klaviyo.com'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: ICONS.sendgrid,
    description: 'Cloud-based email service that delivers transactional and marketing emails.',
    link: 'https://sendgrid.com'
  },
  {
    id: 'brevo',
    name: 'Brevo',
    icon: ICONS.brevo,
    description: 'All-in-one marketing platform for email campaigns, SMS marketing, and CRM.',
    link: 'https://brevo.com'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: ICONS.twitter,
    description: 'Connect with Twitter to schedule tweets, analyze engagement, and manage your social presence.',
    link: 'https://twitter.com'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: ICONS.linkedin,
    description: 'Connect with LinkedIn to manage professional networking, content sharing, and recruiting.',
    link: 'https://linkedin.com'
  },
  {
    id: 'ahrefs',
    name: 'Ahrefs',
    icon: ICONS.ahrefs,
    description: 'SEO platform for backlink analysis, keyword research, and competitor tracking.',
    link: 'https://ahrefs.com'
  }
];

export const COLLABORATION_COMMUNICATION_MCPS: MCPProps[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: ICONS.zoom,
    description: 'Video conferencing, virtual meetings, and team collaboration platform.',
    link: 'https://zoom.us'
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    icon: ICONS.googleMeet,
    description: 'Video conferencing solution designed for business meetings and collaboration.',
    link: 'https://meet.google.com'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    icon: ICONS.microsoftTeams,
    description: 'Business communication platform with workspace chat, videoconferencing, and file storage.',
    link: 'https://teams.microsoft.com'
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: ICONS.outlook,
    description: 'Email and calendar service developed by Microsoft for personal and business use.',
    link: 'https://outlook.com'
  },
  {
    id: 'retellai',
    name: 'Retell AI',
    icon: ICONS.retellai,
    description: 'Voice AI platform for creating interactive, conversational experiences.',
    link: 'https://retellai.com'
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    icon: ICONS.fireflies,
    description: 'AI meeting assistant that records, transcribes, and analyzes voice conversations.',
    link: 'https://fireflies.ai'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    icon: ICONS.calendly,
    description: 'Scheduling automation platform for eliminating the back-and-forth emails for finding meeting times.',
    link: 'https://calendly.com'
  }
];

export const ANALYTICS_DATA_MCPS: MCPProps[] = [
  {
    id: 'google-bigquery',
    name: 'Google BigQuery',
    icon: ICONS.googleBigQuery,
    description: 'Serverless, highly scalable, and cost-effective cloud data warehouse.',
    link: 'https://cloud.google.com/bigquery'
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    icon: ICONS.snowflake,
    description: 'Cloud data platform that enables data storage, processing, and analytic solutions.',
    link: 'https://snowflake.com'
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    icon: ICONS.amplitude,
    description: 'Product analytics platform for tracking user behavior on websites and apps.',
    link: 'https://amplitude.com'
  },
  {
    id: 'posthog',
    name: 'PostHog',
    icon: ICONS.posthog,
    description: 'Open-source product analytics platform for tracking user behavior.',
    link: 'https://posthog.com'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    icon: ICONS.mixpanel,
    description: 'Analytics platform that tracks user interactions with web and mobile applications.',
    link: 'https://mixpanel.com'
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    icon: ICONS.microsoftClarity,
    description: 'Free analytics tool that helps you understand how users interact with your website.',
    link: 'https://clarity.microsoft.com'
  },
  {
    id: 'serpapi',
    name: 'SerpAPI',
    icon: ICONS.serpapi,
    description: 'Search engine results page API to scrape and extract search data programmatically.',
    link: 'https://serpapi.com'
  }
];

export const FINANCE_CRYPTO_MCPS: MCPProps[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: ICONS.stripe,
    description: 'Payment processing platform for internet businesses of all sizes.',
    link: 'https://stripe.com'
  },
  {
    id: 'binance',
    name: 'Binance',
    icon: ICONS.binance,
    description: 'Cryptocurrency exchange that provides a platform for trading digital currencies.',
    link: 'https://binance.com'
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: ICONS.coinbase,
    description: 'Secure platform for buying, selling, and storing cryptocurrency.',
    link: 'https://coinbase.com'
  }
];

// Add more category-specific MCPs as needed 

// Add a mapping between category IDs and section IDs for scroll functionality
export const CATEGORY_SECTIONS = {
  'popular': 'popular-section',
  'productivity': 'productivity-section',
  'devtools': 'developer-tools-section',
  'marketing': 'marketing-social-section',
  'collaboration': 'collaboration-communication-section',
  'analytics': 'analytics-data-section',
  'finance': 'finance-crypto-section',
  'document': 'document-section',
  'misc': 'misc-section'
}; 