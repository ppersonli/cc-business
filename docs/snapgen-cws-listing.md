# SnapGen — Chrome Web Store Listing Materials

## Product Name
SnapGen - AI Screenshot to Code

## Short Description (132 chars max)
Capture any screenshot and instantly get AI-powered descriptions, HTML/CSS code, or UI design feedback.

## Detailed Description

SnapGen is an AI-powered screenshot analysis tool that helps designers and developers work faster.

**How it works:**
1. Click the SnapGen icon or press Ctrl+Shift+S (Cmd+Shift+S on Mac)
2. SnapGen captures your visible browser tab
3. Choose an analysis mode: Describe, Generate Code, or UI Review
4. Get instant AI-powered results you can copy and use

**Features:**
• **Screenshot Capture** — One-click capture of any visible browser tab
• **AI Describe** — Get detailed text descriptions of any screenshot
• **Code Generation** — Generate HTML/CSS code that replicates the UI
• **UI Review** — Get expert UX/design feedback and improvement suggestions
• **Analysis History** — Review and manage all your past analyses
• **BYOK (Bring Your Own Key)** — Use your own OpenAI or Anthropic API key for full control
• **Multiple AI Providers** — Supports OpenAI GPT-4o and Claude models
• **Pro Plan** — Unlimited analyses with hosted API (no key needed)

**Privacy-first:**
• Screenshots are sent directly to AI APIs you configure — never stored on our servers
• All data stays in your browser
• No browsing history tracking

**Free tier:** 5 analyses per day
**Pro plan:** Unlimited analyses, $9.99/month
**Pro BYOK:** Use your own API key, $4.99/month

Perfect for designers, developers, and anyone who needs to quickly understand, replicate, or review web interfaces.

## Category
Developer Tools

## Language
English

## Permission Justifications

| Permission | Justification |
|-----------|---------------|
| `storage` | Saves user settings (API key, model preference) and analysis history locally in the browser. No data is sent to external servers. |
| `sidePanel` | Displays the main capture and analysis interface in a Chrome side panel, providing a dedicated workspace for screenshot analysis. |
| `commands` | Enables keyboard shortcut (Ctrl+Shift+S / Cmd+Shift+S) for quick screenshot capture without navigating to the extension icon. |
| `tabs` | Captures the visible area of the current browser tab when the user requests a screenshot. Required for `chrome.tabs.captureVisibleTab()`. |
| `cookies` | Reads the `auth_token` cookie from tools.pixiaoli.cn to verify Pro subscription status. No cookies are modified or sent to third parties. |

## Host Permission Justifications

| Host Permission | Justification |
|----------------|---------------|
| `https://api.openai.com/*` | Sends screenshot data to OpenAI's vision API for analysis when the user selects OpenAI as their provider. |
| `https://api.anthropic.com/*` | Sends screenshot data to Anthropic's Claude API for analysis when the user selects Claude as their provider. |
| `https://tools.pixiaoli.cn/*` | Checks Pro subscription status via the backend API. Used only for subscription verification. |

## Screenshots Needed
1. **Main capture interface** (1280×800) — Shows the side panel with capture button
2. **Analysis results** (1280×800) — Shows code generation output
3. **History view** (1280×800) — Shows analysis history list

## Promotional Images
- **Small tile**: 440×280
- **Large tile**: 1400×560

## Contact Email
support@pixiaoli.cn

## Privacy Policy URL
https://tools.pixiaoli.cn/privacy/

## Terms of Service URL
https://tools.pixiaoli.cn/terms/
