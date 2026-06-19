# TabMaster AI — Feature Specification

> **Date**: 2026-06-09
> **Based on**: extension-research-report.md (V46)
> **Status**: Draft — awaiting user confirmation
> **Target**: Chrome Web Store (Manifest V3)

---

## 1. Executive Summary

TabMaster AI is an AI-powered Chrome tab manager and workflow automation extension. It helps Chrome power users (20+ tabs/day) organize, search, and automate their browsing workflow using AI.

**Core Value Proposition**: "Use AI to manage your Chrome tabs, save time, boost efficiency."

**Target Users**:
- Chrome power users (20+ tabs daily)
- Knowledge workers (programmers, designers, researchers)
- Multi-taskers (simultaneous projects)

---

## 2. Feature Breakdown by Priority

### P0 — MVP (Must-Have for Launch)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Tab List & Management** | View all open tabs, group by window, close/activate tabs |
| 2 | **AI Tab Classification** | Auto-categorize tabs by content (Work, Research, Social, Shopping, Entertainment, News, Other) |
| 3 | **Tab Snapshots** | Save current tab group as named snapshot, restore later |
| 4 | **AI Tab Search** | Natural language search across all open tabs ("find that article about React I had open yesterday") |
| 5 | **Quick Actions** | Close duplicate tabs, close inactive tabs (24h+), pin important tabs |
| 6 | **Side Panel UI** | Full-featured side panel (not popup) for persistent access |

### P1 — Important (Phase 2)

| # | Feature | Description |
|---|---------|-------------|
| 7 | **AI Workflow Automation** | Auto-execute repeated tasks (e.g., "every morning open these 5 tabs") |
| 8 | **AI Focus Mode** | Auto-hide irrelevant tabs based on current task context |
| 9 | **Tab Notes** | Add notes/bookmarks to specific tabs |
| 10 | **Export/Import** | Export snapshots as JSON, import on another device |
| 11 | **Keyboard Shortcuts** | Quick access to common actions |

### P2 — Nice-to-Have (Phase 3)

| # | Feature | Description |
|---|---------|-------------|
| 12 | **Cross-Device Sync** | Sync snapshots across devices via cloud |
| 13 | **Team Collaboration** | Share tab groups with team members |
| 14 | **Analytics Dashboard** | Browsing habits, time spent per category |
| 15 | **Custom Categories** | User-defined classification rules |

---

## 3. Architecture

### 3.1 Tech Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| Extension Framework | WXT + Vue 3 + TypeScript | Active maintenance, small builds, excellent DX |
| AI API | OpenAI GPT-4o-mini | Cost-effective ($0.15/1M input tokens) |
| Storage | chrome.storage.local | 10MB limit, sufficient for snapshots |
| UI | Side Panel API | Persistent access, better than popup |
| Payments | Waffo Pancake | Shared with tools.ovanime.com |

### 3.2 Project Structure

```
tabmaster-ai/
├── entrypoints/
│   ├── sidepanel/
│   │   ├── SidePanel.vue          # Main side panel UI
│   │   └── App.vue                # Root component
│   ├── background/
│   │   └── index.ts               # Service worker
│   └── popup/
│       ├── Popup.vue              # Minimal popup (quick actions)
│       └── main.ts
├── components/
│   ├── TabList.vue                # Tab list with grouping
│   ├── TabCard.vue                # Individual tab display
│   ├── AISearch.vue               # Natural language search
│   ├── SnapshotManager.vue        # Save/restore snapshots
│   ├── CategoryFilter.vue         # Filter by AI category
│   ├── QuickActions.vue           # Close duplicates, inactive, etc.
│   ├── FocusMode.vue              # AI focus mode toggle
│   └── Settings.vue               # Extension settings
├── composables/
│   ├── useTabs.ts                 # Tab CRUD operations
│   ├── useSnapshots.ts            # Snapshot save/restore
│   ├── useAI.ts                   # AI API calls
│   ├── useCategories.ts           # Tab classification
│   └── useStorage.ts              # Chrome storage abstraction
├── utils/
│   ├── tab-utils.ts               # Tab manipulation helpers
│   ├── ai-prompts.ts              # AI prompt templates
│   └── subscription.ts            # Auth + subscription (shared with SnapGen)
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── public/
│   └── _locales/                  # i18n translations
│       ├── en/messages.json
│       ├── pt/messages.json
│       ├── es/messages.json
│       └── ja/messages.json
├── manifest.json
├── wxt.config.ts
├── package.json
└── tests/
    ├── utils/
    │   ├── tab-utils.test.ts
    │   └── ai-prompts.test.ts
    └── composables/
        ├── useTabs.test.ts
        └── useSnapshots.test.ts
```

### 3.3 Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "TabMaster AI — Smart Tab Manager",
  "version": "1.0.0",
  "description": "AI-powered tab management, search, and workflow automation for Chrome power users",
  "permissions": [
    "storage",
    "sidePanel",
    "tabs",
    "cookies",
    "commands"
  ],
  "host_permissions": [
    "https://tools.ovanime.com/*",
    "https://api.openai.com/*"
  ],
  "side_panel": {
    "default_path": "sidepanel/index.html"
  },
  "background": {
    "service_worker": "background/index.ts"
  },
  "action": {
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    },
    "default_title": "TabMaster AI"
  },
  "commands": {
    "_execute_side_panel": {
      "suggested_key": {
        "default": "Ctrl+Shift+T",
        "mac": "Command+Shift+T"
      },
      "description": "Open TabMaster AI"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

**Permission Justification** (for Chrome Web Store review):
| Permission | Why Needed |
|-----------|-----------|
| `storage` | Save snapshots, settings, AI cache |
| `sidePanel` | Main UI lives in side panel |
| `tabs` | Read tab titles/URLs, activate/close tabs |
| `cookies` | Read auth_token from tools.ovanime.com for subscription |
| `commands` | Keyboard shortcut to open side panel |
| `host_permissions: tools.ovanime.com` | Subscription status API |
| `host_permissions: api.openai.com` | AI API calls for classification/search |

---

## 4. Core Feature Technical Design

### 4.1 AI Tab Classification

**How it works**:
1. Read all open tabs (title + URL)
2. Send batch to GPT-4o-mini with classification prompt
3. Cache results in chrome.storage.local (5min TTL)
4. Update UI with categories

**AI Prompt**:
```
Classify these browser tabs into categories. Return JSON array.

Categories: work, research, social, shopping, entertainment, news, other

Tabs:
{tabs.map(t => `${t.id}: ${t.title} (${t.url})`).join('\n')}

Return: [{"id": tabId, "category": "work", "confidence": 0.95}]
```

**Cost estimate**: ~$0.001 per classification (50 tabs, ~2K tokens)
**Rate limit**: Classify once per 5 minutes, cache results

### 4.2 AI Tab Search

**How it works**:
1. User types natural language query
2. Send query + all tab titles/URLs to GPT-4o-mini
3. AI returns matching tab IDs with relevance scores
4. Highlight and scroll to matching tabs

**AI Prompt**:
```
User is looking for a specific tab. Find the most relevant matches.

Query: "{userQuery}"

Open tabs:
{tabs.map(t => `${t.id}: ${t.title} (${t.url})`).join('\n')}

Return: [{"id": tabId, "relevance": 0.95, "reason": "why this matches"}]
Sort by relevance descending.
```

### 4.3 Tab Snapshots

**Storage format**:
```typescript
interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  tabs: {
    url: string;
    title: string;
    pinned: boolean;
    favIconUrl?: string;
  }[];
  windowId: number;
}
```

**Storage**: `chrome.storage.local` key `snapshots` (array)
**Limit**: ~50 snapshots (each ~5KB, total ~250KB, well under 10MB)

### 4.4 Quick Actions

| Action | Implementation |
|--------|---------------|
| Close duplicates | Group tabs by URL, keep one per group, close rest |
| Close inactive (24h) | Use `chrome.tabs.onActivated` timestamp tracking |
| Close all except pinned | Filter `tabs.query({pinned: false})`, close each |
| Restore last closed | Keep last 10 closed tabs in storage |
| Move tab to new window | `chrome.windows.create({tabId})` |

### 4.5 AI Focus Mode (P1)

**Concept**: User declares current task ("working on React project"), AI identifies relevant tabs and hides the rest.

**Implementation**:
1. User types task description
2. AI classifies all tabs as "relevant" or "irrelevant" to the task
3. Irrelevant tabs are moved to a "hidden" group (not closed, just minimized)
4. User can exit focus mode to restore all tabs

---

## 5. UI Design

### 5.1 Side Panel Layout

```
┌─────────────────────────────┐
│ 🧠 TabMaster AI        ⚙️  │  ← Header
├─────────────────────────────┤
│ 🔍 Search tabs...          │  ← AI Search bar
├─────────────────────────────┤
│ [All] [Work] [Research]    │  ← Category filter tabs
│ [Social] [Shopping] [+]    │
├─────────────────────────────┤
│ 📌 Pinned (3)              │  ← Pinned section
│   ├ 📄 React Docs          │
│   ├ 📄 TypeScript Handbook │
│   └ 📄 Next.js Docs        │
├─────────────────────────────┤
│ 💼 Work (8)                │  ← Category section
│   ├ 📄 Jira Board          │
│   ├ 📄 Slack                │
│   └ ...                    │
├─────────────────────────────┤
│ 🔬 Research (5)            │
│   ├ 📄 AI Tab Management   │
│   └ ...                    │
├─────────────────────────────┤
│ ─────────────────────────── │
│ 📸 Snapshots (3)           │  ← Snapshots section
│   ├ "Morning routine"      │
│   ├ "React project"        │
│   └ "Research session"     │
├─────────────────────────────┤
│ ⚡ Quick Actions            │  ← Action buttons
│ [Close Dupes] [Close Old]  │
│ [Focus Mode] [New Snapshot]│
└─────────────────────────────┘
```

### 5.2 Visual Design

- **Theme**: Light/dark mode support
- **Colors**: Green accent (#07C160) matching tools.ovanime.com
- **Typography**: System font stack
- **Animations**: Subtle transitions for category switching
- **Responsive**: Side panel width 400px (Chrome default)

---

## 6. Subscription Integration

### 6.1 Auth Flow (Cookie-Based)

Same as SnapGen:
1. User logs in on tools.ovanime.com
2. Extension reads `auth_token` cookie
3. Extension calls `/api/subscription/status`
4. Backend returns plan info
5. Extension unlocks Pro features

### 6.2 Free vs Pro

| Feature | Free | Pro ($4/mo) |
|---------|------|-------------|
| Tab list & management | ✅ | ✅ |
| Close duplicates/inactive | ✅ | ✅ |
| Save snapshots (max 5) | ✅ | ✅ Unlimited |
| AI tab classification | ❌ | ✅ |
| AI tab search | ❌ | ✅ |
| AI focus mode | ❌ | ✅ |
| AI workflow automation | ❌ | ✅ |
| Custom categories | ❌ | ✅ |

### 6.3 Usage Tracking

```typescript
// Track AI usage for rate limiting
interface UsageTracker {
  aiClassifications: number;  // Free: 5/day, Pro: unlimited
  aiSearches: number;         // Free: 10/day, Pro: unlimited
  snapshots: number;          // Free: 5 total, Pro: unlimited
  lastReset: number;          // Timestamp of daily reset
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests
- `tab-utils.test.ts` — Tab manipulation functions
- `ai-prompts.test.ts` — Prompt template generation
- `useTabs.test.ts` — Tab composable logic
- `useSnapshots.test.ts` — Snapshot save/restore

### 7.2 Integration Tests
- AI classification flow (mock OpenAI API)
- Snapshot save/restore cycle
- Subscription status check

### 7.3 E2E Tests (Playwright)
- Load extension in Chrome
- Open side panel
- Verify tab list displays
- Test AI search
- Test snapshot save/restore

### 7.4 Test Command
```bash
pnpm test           # Unit + integration
npx playwright test # E2E
```

---

## 8. SEO & Chrome Web Store

### 8.1 Listing Details

- **Name**: TabMaster AI — Smart Tab Manager
- **Short Description**: AI-powered tab management, search, and workflow automation
- **Category**: Productivity
- **Language**: English (primary), Portuguese, Spanish, Japanese

### 8.2 Detailed Description

```
Tired of 50+ open tabs? TabMaster AI uses AI to organize, search, and automate your Chrome tabs.

✨ FEATURES:
• AI Tab Classification — Tabs auto-categorized (Work, Research, Social, etc.)
• AI Tab Search — Find any tab with natural language ("that React article")
• Tab Snapshots — Save and restore tab groups instantly
• Quick Actions — Close duplicates, close inactive tabs, pin important ones
• AI Focus Mode — Hide irrelevant tabs, focus on your current task
• Keyboard Shortcuts — Open with Ctrl+Shift+T

🆓 FREE TIER:
• Tab management, quick actions, 5 snapshots
• No account required

💎 PRO TIER ($4/month):
• Unlimited AI classifications and searches
• Unlimited snapshots
• AI focus mode and workflow automation
• Custom categories

🔒 PRIVACY:
• All data stays on your device
• AI calls are anonymous (no personal data sent)
• No browsing history collected

Perfect for developers, researchers, and anyone who lives in Chrome.
```

### 8.3 Screenshots Needed
1. Side panel with tab list and categories
2. AI search in action
3. Snapshot manager
4. Focus mode
5. Settings/subscription

---

## 9. Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] WXT project setup
- [ ] Side panel UI framework
- [ ] Tab list & management (P0 #1)
- [ ] Quick actions (P0 #6)
- [ ] Tab snapshots (P0 #3)
- [ ] Basic styling & dark mode

### Phase 2: AI Features (Week 2-3)
- [ ] AI tab classification (P0 #2)
- [ ] AI tab search (P0 #4)
- [ ] OpenAI API integration
- [ ] Usage tracking & rate limiting

### Phase 3: Polish & Publish (Week 3-4)
- [ ] Subscription integration (Waffo Pancake)
- [ ] i18n (EN/PT/ES/JA)
- [ ] Chrome Web Store assets (screenshots, icons)
- [ ] Privacy policy & terms of service
- [ ] Submit to Chrome Web Store

### Phase 4: Post-Launch (Week 5-8)
- [ ] AI focus mode (P1 #8)
- [ ] AI workflow automation (P1 #7)
- [ ] Keyboard shortcuts (P1 #11)
- [ ] User feedback iteration
- [ ] Product Hunt launch

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Chrome review rejection | Minimal permissions, clear privacy policy |
| AI API costs | GPT-4o-mini ($0.15/1M tokens), rate limiting |
| Low install rate | Chrome Web Store SEO, Product Hunt, Reddit |
| User retention | Free tier must be genuinely useful |
| Service worker sleep | Use chrome.storage for state, not globals |

---

**Document Status**: Draft
**Next Step**: User confirmation → CC development in tmux cc-web
