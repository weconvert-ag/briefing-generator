# Figma Briefing Generator — Documentation

## Overview

This plugin generates structured A/B test briefing layouts inside Figma. Users fill in a form panel with test details, click "Generate with AI" to auto-fill CRO briefing content via OpenAI, then generate a complete briefing frame on the Figma canvas.

The generated layout includes:
- A navy title bar with the test name
- A navy sidebar with hypothesis, identified problems, proposals, behavioral reasons, metrics, and URL
- Two screenshot placeholder columns (CONTROL and REFERENCE)
- A WeConvert logo badge (bottom-right)

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
  → Returns structured JSON
        ↓
Auto-fills: Hypothesis, Problems, Proposals, Reasons Why
        ↓
User reviews/edits AI output, fills Metrics and URL
        ↓
User clicks "Generate Briefing"
        ↓
UI sends data via parent.postMessage()
        ↓
code.js receives message via figma.ui.onmessage
        ↓
Plugin creates frames, text, shapes, and images
        ↓
Briefing layout appears on canvas
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
│   └── wc-logo.png                            ← WeConvert logo
│
├── code.js                                    ← Main plugin logic (layout generation)
├── ui.html                                    ← Form UI + AI integration (~14KB)
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

A self-contained HTML file (~14KB) with all form fields, styles, and AI logic inline. No build step, no Node.js, no backend.

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

### Section 4: Measurement (user fills in)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Metric 1, 2, 3 | text inputs | No | Three KPIs to measure the test |
| URL Rule | text input | No | URL or page where the test runs |

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
7. Parses JSON, strips any citation markers, auto-fills the 4 output fields
8. Highlights auto-filled fields with green border (resets on user edit)

## Why Assistants API (not Chat Completions)

- Research PDFs live in OpenAI's vector store — no need to embed 80KB+ of text in the HTML file
- The assistant automatically searches the correct research document based on client name
- Adding a new client = just upload their PDF to the assistant's file store
- `ui.html` stays small (~14KB vs ~105KB with embedded research)

## System Prompt

Full instructions in `briefing-ai-assistant-generator.md` (v1.1). Key features:
- **Client Isolation Rule** — only uses the research doc matching the selected client
- **Research Priority System** — searches research first, uses concrete data with real numbers
- **Bullet composition rule** — identified problems always mix 3-4 data-driven + 1-2 best practice bullets
- **No citation markers** — output is clean, ready for Figma layout
- **Approved cognitive bias list** (9 biases)
- **Language matching** — responds in same language as input

## Clients

| Client | Research Document | Status |
|--------|-------------------|--------|
| Nominal | CRO research deck (148 pages) — analytics, heatmaps, user testing, surveys | Active |
| Led Esthetics | CRO research deck — uploaded to OpenAI | Active |

## Cost

- Model: `gpt-4o-mini` at $0.15/1M input tokens
- Each briefing call: ~$0.003-0.005
- 100 briefings/month: ~$0.50
- Current credit: $5.00 (OpenAI free trial)

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

### Constants
- **Colors:** NAVY (`#123D5C`), WHITE, LIGHT_GRAY, DARK_GRAY
- **Dimensions:** Frame 1400×900, Title bar 55px, Sidebar 300px wide

### Fonts
```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
```

### Layout Structure

```
┌──────────────────────────────────────────────┐
│  TITLE BAR (navy, full width, test name)     │
├──────────┬───────────────────────────────────┤
│          │                                   │
│ SIDEBAR  │   CONTROL        REFERENCE        │
│ (navy)   │   [screenshot]   [screenshot]     │
│          │   placeholder    placeholder      │
│ • Test   │                                   │
│ • Hypoth │                                   │
│ • Probs  │                                   │
│ • Propos │                                   │
│ • Reason │                                   │
│ • Metric │                                   │
│ • URL    │                        [WC Logo]  │
└──────────┴───────────────────────────────────┘
```

### Sidebar Sections (cursor-based Y positioning)

1. **Test Name** — bold header
2. **Hypothesis** — header + body
3. **Identified Problems** — lines split by `\n`, prefixed with `•`
4. **What We Proposed** — lines split by `\n`, prefixed with `•`
5. **Reasons Why** — parsed with `—` delimiter, numbered (1., 2., 3.)
6. **Measured By** — three metrics as bullet list
7. **URL** — url rule

### Content Area
- **CONTROL** — light gray rectangle placeholder
- **REFERENCE** — slightly darker gray rectangle placeholder

### WeConvert Logo
Base64-encoded PNG, decoded and placed bottom-right.

---

# How to Run

```
Figma → Plugins → Development → Briefing Generator
```

1. Select **Client** (Nominal or Led Esthetics)
2. Fill in **Test Name**, **Page**, **Change Description**, **Goal**
3. Optionally add **Context** and **Metrics**
4. Click **"Generate with AI"** → wait for auto-fill (~5-15 seconds)
5. Review/edit the AI-generated fields
6. Click **"Generate Briefing"** → layout appears on canvas

---

# Quick Reference

### Key files:
- `ui.html` — All UI + AI logic (~14KB, self-contained)
- `code.js` — Figma layout generation
- `briefing-ai-assistant-generator.md` — AI system prompt v1.1 (also paste into OpenAI Assistant settings)

### To change API key:
Edit `ui.html` line with `var OPENAI_API_KEY = '...';`

### To change model:
Edit `ui.html` line with `var OPENAI_MODEL = '...';`

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

## v2 (Current — AI Integration)
- Added: Client dropdown (Nominal, Led Esthetics), Page dropdown, Change Description, Goal, Context
- Added: "Generate with AI" → OpenAI Assistants API with File Search
- Research PDFs stored in OpenAI vector store (not embedded in HTML)
- System prompt v1.1: client isolation, data-driven problems, mixed data + best practices
- Panel size: 380×900
- Self-contained: no build step, no backend, ~14KB ui.html

## Status

**v2 implementation is COMPLETE.** AI generation tested and working in OpenAI Playground.

**Next step:** Test end-to-end in Figma (Generate with AI → review → Generate Briefing → canvas layout).

---

# End of Documentation
