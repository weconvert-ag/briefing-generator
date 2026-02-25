# Figma Briefing Generator — Documentation

## Overview

This plugin generates structured A/B test briefing layouts inside Figma. Users fill in a form panel with test details, click "Generate with AI" to auto-fill CRO briefing content via OpenAI, then generate a complete briefing frame on the Figma canvas.

The generated layout includes:
- A navy title bar with the test name (40px bold white text)
- A light gray sidebar (#F5F5F5) with hypothesis, identified problems, proposals, behavioral reasons, metrics, and URL
- Two screenshot placeholder columns (CONTROL and REFERENCE) with 30px bold labels
- A WeConvert logo (bottom-right of frame)
- 1px black stroke border on both the frame and sidebar

---

# Architecture

```
User opens plugin
        ↓
UI form panel (ui.html) appears
        ↓
User fills in test setup fields (Client, Test Name, Page, etc.)
        ↓
User clicks "Generate with AI"
        ↓
Plugin calls OpenAI Assistants API
  → Creates thread → Sends message → Runs assistant
  → Assistant searches client research PDF via File Search
  → Returns structured JSON (hypothesis, problems, proposals, reasons, metrics, url_rule)
        ↓
Auto-fills: Hypothesis, Problems, Proposals, Reasons Why, Metrics, URL Rule
        ↓
User reviews/edits AI output
        ↓
User clicks "Generate Briefing"
        ↓
UI sends data via parent.postMessage()
        ↓
code.js receives message via figma.ui.onmessage
        ↓
Plugin creates frames, text, shapes, and images
        ↓
Briefing layout appears on canvas (centered on current viewport)
```

---

# File Structure

```
Briefing Generator/
│
├── Briefing Generator/                        ← Subfolder Figma loads from
│   ├── manifest.json                          ← Plugin config
│   ├── code.js                                ← Main plugin logic (synced from root)
│   ├── ui.html                                ← Form UI (synced from root)
│   └── wc-logo.png                            ← WeConvert logo source file
│
├── code.js                                    ← Main plugin logic (layout generation)
├── ui.html                                    ← Form UI + AI integration (~16KB)
├── documentation.md                           ← This file
├── briefing-ai-assistant-generator.md         ← AI system prompt v1.1
├── nominal-research-text.txt                  ← Extracted text from Nominal research (reference)
├── _Nominal - CRO Research_compressed (1).pdf ← Nominal research PDF (reference)
└── TECHLEAD-PLAN-v2.md                        ← Implementation plan (reference)
```

> **Important:** Figma loads from the `Briefing Generator/` subfolder. Both `ui.html` and `code.js` must be synced between root and subfolder after any edit:
> ```
> cp ui.html "Briefing Generator/ui.html"
> cp code.js "Briefing Generator/code.js"
> ```

---

# manifest.json

```json
{
  "name": "Briefing Generator",
  "id": "1607226209691497768",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"]
}
```

---

# UI Panel (ui.html)

A self-contained HTML file (~16KB) with all form fields, styles, and AI logic inline. No build step, no Node.js, no backend.

Opens via `figma.showUI(__html__, { width: 380, height: 900 })`.

## Form Sections

### Section 1: Test Setup (user fills in)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client | dropdown | Yes | Nominal, Led Esthetics |
| Test Name | text input | Yes | e.g. `NMN\|PP\|AB21 – Redesign Benefits` |
| Page | dropdown | Yes | Homepage, PDP, Cart, Collection, Menu, Checkout, Other |
| Change Description | textarea | Yes | What will be changed/tested |
| Goal | text input | Yes | Primary metric or objective |
| Context | textarea | No | Optional analytics insight, survey finding |

### Section 2: AI Generation

| Element | Description |
|---------|-------------|
| "Generate with AI" button | Green button, calls OpenAI Assistants API |
| AI Status | Animated status: Creating thread → Sending message → AI analyzing → Reading response |

### Section 3: AI-Generated Content (editable)

| Field | Type | Auto-filled | Description |
|-------|------|-------------|-------------|
| Hypothesis | textarea | Yes | Single sentence: If we [change], we expect [metric] because [reason] |
| Identified Problems | textarea | Yes | 5-6 bullets, one per line (mix of data + best practices) |
| What We Propose | textarea | Yes | 4-6 bullets, one per line |
| Reasons Why | textarea | Yes | 3 cognitive biases, format: `Bias — Explanation` |

### Section 4: Measurement (auto-filled by AI, editable)

| Field | Type | Auto-filled | Description |
|-------|------|-------------|-------------|
| Metric 1, 2, 3 | text inputs | Yes | Three KPIs to measure the test |
| URL Rule | text input | Yes | URL or page where the test runs |

### Demo Buttons

| Button | Location | Description |
|--------|----------|-------------|
| **Fill Demo** | Header (top-right) | Fills only Test Setup fields (Client, Test Name, Page, Change Description, Goal). Use before "Generate with AI" to test the AI flow. |
| **Fill AI Demo** | AI-Generated Content section | Fills ALL fields (Test Setup + AI content + Metrics + URL). Use to test the full layout without calling the API. Saves API tokens. |

Both buttons use blue styling (#EBF2F7 bg, #123D5C text) and apply green highlight (#2E7D32 border, #f0f8f0 bg) on auto-filled fields that resets on user edit.

---

# AI Integration (v2 — OpenAI Assistants API)

## Provider: OpenAI
- **Model:** `gpt-4o-mini`
- **API:** Assistants API v2 (threads + runs + file search)
- **Assistant ID:** `asst_cT0xJb13dDkKh9GEHZhXTruA`
- **Architecture:** Frontend-only — all API calls from `ui.html` via `fetch()`
- **Research docs:** Uploaded as PDFs in OpenAI's vector store (File Search enabled)

## How It Works

1. User clicks "Generate with AI"
2. Plugin creates a new **thread** via `POST /v1/threads`
3. Adds user input as a **message** via `POST /v1/threads/{id}/messages`
4. Starts a **run** with the assistant via `POST /v1/threads/{id}/runs`
5. **Polls** the run status every 1.5s until `completed`
6. Fetches the assistant's **response** via `GET /v1/threads/{id}/messages`
7. Parses JSON, strips any citation markers, auto-fills all output fields:
   - Hypothesis, Identified Problems, What We Propose, Reasons Why
   - Metrics (3 KPIs), URL Rule
8. Highlights auto-filled fields with green border (resets on user edit)

## AI Output JSON Schema

```json
{
  "hypothesis": "If we [change], we expect [metric] because [reason].",
  "identified_problems": ["Problem 1", "Problem 2", "..."],
  "what_we_propose": ["Proposal 1", "Proposal 2", "..."],
  "reasons_why": [
    { "bias": "Bias Name", "explanation": "..." },
    { "bias": "Bias Name", "explanation": "..." },
    { "bias": "Bias Name", "explanation": "..." }
  ],
  "metrics": ["Primary KPI", "Secondary KPI", "Tertiary KPI"],
  "url_rule": "Page or URL pattern"
}
```

## Why Assistants API (not Chat Completions)

- Research PDFs live in OpenAI's vector store — no need to embed 80KB+ of text in the HTML file
- The assistant automatically searches the correct research document based on client name
- Adding a new client = just upload their PDF to the assistant's file store
- `ui.html` stays small (~16KB vs ~105KB with embedded research)

## System Prompt

Full instructions in `briefing-ai-assistant-generator.md` (v1.1). Key features:
- **Client Isolation Rule** — only uses the research doc matching the selected client
- **Research Priority System** — searches research first, uses concrete data with real numbers
- **Bullet composition rule** — identified problems always mix 3-4 data-driven + 1-2 best practice bullets
- **No citation markers** — output is clean, ready for Figma layout
- **Approved cognitive bias list** (9 biases)
- **Language matching** — responds in same language as input
- **Metrics generation** — returns 3 relevant KPIs based on test goal
- **URL Rule generation** — returns page/URL pattern where test runs

## Clients

| Client | Research Document | Status |
|--------|-------------------|--------|
| Nominal | CRO research deck (148 pages) — analytics, heatmaps, user testing, surveys | Active |
| Led Esthetics | CRO research deck — uploaded to OpenAI | Active |

## Cost

- Model: `gpt-4o-mini` at $0.15/1M input tokens
- Each briefing call: ~$0.003-0.005
- 100 briefings/month: ~$0.50

---

# code.js — Plugin Logic

## Entry Point

```js
figma.showUI(__html__, { width: 380, height: 900 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await createBriefing(msg.data);
    figma.closePlugin();
  }
};
```

## createBriefing(input)

Builds the entire Figma layout from form data.

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| NAVY | `#123D5C` | Title bar background |
| WHITE | `#FFFFFF` | Frame background, title text |
| BG_LEFT | `#F5F5F5` | Sidebar background |
| BLACK | `#000000` | All text, stroke borders |
| PLACEHOLDER_BG | `#EBEBEB` | Screenshot placeholder rectangles |
| PLACEHOLDER_TEXT | `#999999` | Screenshot placeholder labels |

### Dimensions

| Constant | Value | Description |
|----------|-------|-------------|
| FRAME_W | 2174px | Frame width |
| FRAME_H | 1465px | Frame height (minimum, expands dynamically) |
| TITLE_BAR_H | 80px | Navy title bar height |
| SIDEBAR_W | 548px | Left sidebar width |
| SIDEBAR_PADDING | 36px | Sidebar left/right padding |
| SIDEBAR_TEXT_W | 476px | Text width (SIDEBAR_W - 2 × padding) |
| SCREENSHOT_W | 480px | Screenshot placeholder width |
| SCREENSHOT_H | 950px | Screenshot placeholder height |

### Fonts

```js
await figma.loadFontAsync({ family: "Inter", style: "Light" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
```

### Typography

| Element | Font | Size | Line Height | Usage |
|---------|------|------|-------------|-------|
| Title bar | Inter Bold | 40px | auto | Test name in navy bar |
| Section headers | Inter Bold | 18px | 19px | "Hypothesis", "Identified problems:", etc. |
| Sub-headers | Inter Semi Bold | 18px | 19px | Test name in sidebar, bias names |
| Body text | Inter Regular | 16px | 19px | Hypothesis text, problem bullets, proposals |
| CONTROL/REFERENCE | Inter Bold | 30px | auto | Screenshot column labels |

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  TITLE BAR (navy, 80px, full width, test name 40px)  │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│ SIDEBAR      │    CONTROL          REFERENCE         │
│ (#F5F5F5)    │    [480×950          [480×950          │
│ W: 548       │     screenshot]      screenshot]      │
│              │     placeholder      placeholder      │
│ • Client     │                                       │
│ • Test Name  │                                       │
│ • Hypothesis │                                       │
│ • Problems   │                                       │
│ • Proposals  │                                       │
│ • Reasons    │                                       │
│ • Metrics    │                                       │
│ • URL Rule   │                          [WC Logo]    │
│ 1px stroke   │                          180×56       │
└──────────────┴───────────────────────────────────────┘
  1px black stroke border on frame
```

### Frame Positioning

The briefing frame is placed **centered on the user's current viewport** using `figma.viewport.center`, so it appears where the user is currently looking in Figma (not at a fixed position).

```js
var viewCenter = figma.viewport.center;
frame.x = Math.round(viewCenter.x - FRAME_W / 2);
frame.y = Math.round(viewCenter.y - FRAME_H / 2);
```

### Dynamic Height Resize

After all sidebar content is placed, the plugin checks if text overflows the frame. If so, it expands both the frame and sidebar background to fit, with 30px bottom padding.

```js
var requiredH = cursorY + 30;
if (requiredH > FRAME_H) {
  FRAME_H = requiredH;
  frame.resize(FRAME_W, FRAME_H);
  sidebarBg.resize(SIDEBAR_W, FRAME_H - TITLE_BAR_H);
}
```

This ensures the gray sidebar always reaches the bottom regardless of content length.

### Sidebar Sections (cursor-based Y positioning)

1. **Client Name** — bold header (uppercased)
2. **Test Name** — semi-bold
3. **Hypothesis** — header + body
4. **Identified Problems** — lines split by `\n`, prefixed with `•`
5. **What We Proposed** — lines split by `\n`, numbered (1., 2., 3.)
6. **Reasons Why** — parsed with `—` delimiter, numbered with semi-bold bias name + regular explanation
7. **Measured By** — three metrics as bullet list
8. **URL Rule** — url rule text

### Content Area

- **CONTROL** — light gray rectangle placeholder (480×950) with centered label
- **REFERENCE** — light gray rectangle placeholder (480×950) with centered label
- Both centered horizontally in the right content area with 80px gap

### WeConvert Logo

Base64-encoded PNG from `wc-logo.png`, decoded via `figma.base64Decode()` and placed bottom-right of the frame (180×56px, 16px from right edge, 12px from bottom).

---

# Data Flow: UI → Plugin

When "Generate Briefing" is clicked, `ui.html` sends this message:

```js
parent.postMessage({
  pluginMessage: {
    type: 'generate',
    data: {
      client: "Nominal",
      testName: "NMN|PP|AB32 – Sticky Add to Cart CTA",
      hypothesis: "If we add a sticky bottom bar...",
      identifiedProblems: "Problem 1\nProblem 2\nProblem 3",
      whatWePropose: "Proposal 1\nProposal 2",
      reasonsWhy: "Bias 1 — Explanation\nBias 2 — Explanation",
      metric1: "Add-to-Cart Rate",
      metric2: "Conversion Rate",
      metric3: "Revenue per Session",
      urlRule: "All product pages (/products/*)"
    }
  }
}, '*');
```

Validation: requires at minimum `testName` and `hypothesis`.

---

# How to Run

```
Figma → Plugins → Development → Briefing Generator
```

### Full AI Flow:
1. Select **Client** (Nominal or Led Esthetics)
2. Fill in **Test Name**, **Page**, **Change Description**, **Goal**
3. Optionally add **Context**
4. Click **"Generate with AI"** → wait for auto-fill (~5-15 seconds)
5. Review/edit all AI-generated fields (including Metrics and URL Rule)
6. Click **"Generate Briefing"** → layout appears centered on canvas

### Quick Demo Flow (no API tokens):
1. Click **"Fill AI Demo"** → fills ALL fields with realistic demo data
2. Click **"Generate Briefing"** → layout appears centered on canvas

### Test Setup Only Flow:
1. Click **"Fill Demo"** → fills only Test Setup fields
2. Click **"Generate with AI"** → AI generates the rest from research
3. Review/edit, then click **"Generate Briefing"**

---

# Quick Reference

### Key files:
- `ui.html` — All UI + AI logic (~16KB, self-contained)
- `code.js` — Figma layout generation (~349 lines)
- `briefing-ai-assistant-generator.md` — AI system prompt v1.1 (also paste into OpenAI Assistant settings)

### To change API key:
Edit `ui.html` line with `var OPENAI_API_KEY = '...';`

### To add a new client:
1. Upload their research PDF to the OpenAI Assistant's File Search (vector store)
2. Add `<option value="ClientName">ClientName</option>` to the `#client` select in `ui.html`
3. Sync: `cp ui.html "Briefing Generator/ui.html"`

### After any ui.html or code.js edit:
```
cp ui.html "Briefing Generator/ui.html"
cp code.js "Briefing Generator/code.js"
```

### OpenAI Assistant config:
- **Assistant ID:** `asst_cT0xJb13dDkKh9GEHZhXTruA`
- **Dashboard:** platform.openai.com → Assistants
- **System instructions:** copy from `briefing-ai-assistant-generator.md`
- **File Search:** enabled, vector store with client PDFs
- **Temperature:** 0.40
- **Response format:** json_object

---

# Version History

## v1 (Initial)
- Basic form: Test Name, Hypothesis, Problems, Proposals, Reasons, Metrics, URL
- Manual-only — user fills all fields
- Panel size: 380×720
- Fixed frame position at (100, 100)

## v2 (AI Integration)
- Added: Client dropdown (Nominal, Led Esthetics), Page dropdown, Change Description, Goal, Context
- Added: "Generate with AI" → OpenAI Assistants API with File Search
- Research PDFs stored in OpenAI vector store (not embedded in HTML)
- System prompt v1.1: client isolation, data-driven problems, mixed data + best practices
- Panel size: 380×900
- Self-contained: no build step, no backend

## v3 (Current — Layout Redesign + UX Improvements)
- **Layout redesign:** navy sidebar → light gray (#F5F5F5) sidebar with dark text
- **Frame size:** 2174×1465 (up from 1400×900)
- **Title bar:** 80px height, 40px bold white text on navy
- **Sidebar:** W: 548px, padding: 36px, 1px black stroke border
- **Typography:** headers 18px Bold/Semi Bold, body 16px Regular, CONTROL/REFERENCE 30px Bold
- **Screenshot boxes:** 480×950px with 4px corner radius
- **WeConvert logo:** base64-encoded from wc-logo.png, placed bottom-right (180×56)
- **1px black stroke** on frame and sidebar
- **AI auto-fills Metrics and URL Rule** (added to JSON schema + parsing)
- **Dynamic frame height:** expands if sidebar content overflows, sidebar always reaches bottom
- **Viewport-centered placement:** frame appears where user is currently viewing in Figma
- **Fill Demo button:** fills Test Setup fields only (for AI testing flow)
- **Fill AI Demo button:** fills ALL fields including AI content (saves API tokens for layout testing)
- **Green highlight feedback** on all auto-filled fields (both AI and demo)

## Status

**v3 implementation is COMPLETE.** AI generation and layout tested end-to-end in Figma.

---

# End of Documentation
