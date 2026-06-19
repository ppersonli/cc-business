# TabMaster AI — Chrome Web Store Listing Materials

## Product Name
TabMaster AI - Smart Tab Manager

## Short Description (132 chars max)
AI-powered tab management, search, and workflow automation for Chrome power users.

## Detailed Description
Tired of 50+ open tabs? TabMaster AI uses AI to organize, search, and automate your Chrome tabs.

**How it works:**
1. Click the TabMaster AI icon or press Ctrl+Shift+T (Cmd+Shift+T on Mac)
2. The side panel opens showing all your tabs organized by category
3. Use AI search to find any tab with natural language
4. Save tab groups as snapshots and restore them anytime

**Features:**
• **AI Tab Classification** — Tabs auto-categorized into Work, Research, Social, Shopping, Entertainment, News, and Other
• **AI Tab Search** — Find any tab with natural language ("that React article about hooks")
• **Tab Snapshots** — Save and restore tab groups instantly. Name them, organize them, access them anytime
• **Quick Actions** — Close duplicate tabs, close inactive tabs (24h+), pin important tabs
• **AI Focus Mode** — Hide irrelevant tabs based on your current task, reduce distractions
• **AI Workflow Automation** — Save and replay tab group configurations with one click
• **Keyboard Shortcuts** — Open with Ctrl+Shift+T (Cmd+Shift+T on Mac)

**Privacy-first:**
• All data stays on your device — tabs, snapshots, and settings never leave your browser
• AI calls are anonymous — only tab titles and URLs are sent for classification
• No browsing history collected or stored
• No personal data sent to third parties

**Free tier:** Tab management, quick actions, 5 snapshots, 5 AI classifications/day
**Pro plan:** Unlimited AI features, unlimited snapshots, $4/month

Perfect for developers, researchers, and anyone who lives in Chrome with 20+ tabs open daily.

## Category
Productivity

## Language
English (primary), Portuguese, Spanish, Japanese

## Permission Justifications

| Permission | Justification |
|-----------|---------------|
| `storage` | Saves user settings, tab snapshots, AI cache, and workflow configurations locally in the browser. No data is sent to external servers. |
| `sidePanel` | Displays the main tab management interface in a Chrome side panel, providing persistent access to tab organization features. |
| `tabs` | Reads tab titles, URLs, and favicons to display in the tab list. Activates tabs when user clicks on them. Required for core tab management functionality. |
| `cookies` | Reads the `auth_token` cookie from tools.ovanime.com to verify Pro subscription status. No cookies are modified or sent to third parties. |
| `commands` | Enables keyboard shortcut (Ctrl+Shift+T / Cmd+Shift+T) for quick side panel access without navigating to the extension icon. |

## Host Permission Justifications

| Host Permission | Justification |
|----------------|---------------|
| `https://tools.ovanime.com/*` | Checks Pro subscription status via the backend API. Used only for subscription verification. |
| `https://api.openai.com/*` | Sends tab titles and URLs to OpenAI's GPT-4o-mini API for AI classification and search. Only tab metadata is sent, no personal data. |

## Screenshots Needed
1. **Side panel with tab list and categories** (1280×800) — Shows the main interface with categorized tabs
2. **AI search in action** (1280×800) — Shows natural language search finding a specific tab
3. **Snapshot manager** (1280×800) — Shows saved tab groups with restore functionality
4. **Focus mode** (1280×800) — Shows focused view with irrelevant tabs hidden
5. **Settings/subscription** (1280×800) — Shows settings panel and Pro badge

## Promotional Images
- **Small tile**: 440×280
- **Large tile**: 1400×560

## Contact Email
support@ovanime.com

## Privacy Policy URL
https://tools.ovanime.com/privacy/

## Terms of Service URL
https://tools.ovanime.com/terms/
