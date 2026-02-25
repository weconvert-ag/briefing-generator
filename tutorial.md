# Briefing Generator — Tutorial (How to Use)

This guide walks you through how to use the Briefing Generator plugin to create A/B test briefing layouts in Figma.

---

## Opening the Plugin

1. Open your Figma file
2. Go to **Plugins > Development > Briefing Generator**
3. The plugin panel opens on the right side

You'll see a form with several sections. Fill them in from top to bottom.

---

## The Plugin Form

The form has 4 sections:

1. **Test Setup** — you fill this in manually
2. **Generate with AI** — the AI button
3. **AI-Generated Content** — auto-filled by AI (editable)
4. **Measurement** — metrics and URL (auto-filled by AI, editable)

---

## Workflow 1: Full AI-Assisted Flow (Recommended)

This is the standard workflow for creating a real briefing.

### Step 1: Fill in Test Setup

Fill in the top section of the form:

| Field | What to enter | Example |
|-------|--------------|---------|
| **Client** | Select from dropdown | Nominal |
| **Test Name** | Your test ID and name | `NMN\|PP\|AB32 – Sticky Add to Cart CTA` |
| **Page** | Where the test runs | PDP (Product Detail Page) |
| **Change Description** | What you're changing/testing | "Add a sticky bottom bar with the Add to Cart button that stays visible when scrolling past the main CTA" |
| **Goal** | Primary objective | "Increase Add to Cart Rate" |
| **Context** (optional) | Any supporting data or insight | "Analytics shows 60% of users scroll past the ATC button without clicking" |

### Step 2: Generate with AI

1. Click the green **"Generate with AI"** button
2. Wait for the AI to process (~5-15 seconds)
3. You'll see status updates: Creating thread > Sending message > AI analyzing > Reading response
4. Once complete, all fields below will auto-fill with green borders

The AI uses the client's research PDF to generate data-driven content specific to that client.

### Step 3: Review and Edit AI Content

The AI fills in these fields automatically:

- **Hypothesis** — A structured sentence: "If we [change], we expect [metric] because [reason]"
- **Identified Problems** — 5-6 bullet points mixing research data and best practices
- **What We Propose** — 4-6 actionable proposals
- **Reasons Why** — 3 cognitive biases with explanations (e.g., "Cognitive Load — Explanation")
- **Metric 1, 2, 3** — Three KPIs to measure the test
- **URL Rule** — The URL pattern where the test applies

> All AI-filled fields are editable. Click on any field to modify the content. The green border disappears when you start editing.

### Step 4: Generate the Briefing

1. Make sure all fields look good
2. Click the blue **"Generate Briefing"** button at the bottom
3. The briefing layout appears on your Figma canvas, centered on your current viewport

---

## Workflow 2: Quick Demo (No API Needed)

Use this to test the plugin layout without using API tokens.

1. Open the plugin
2. Click **"Fill AI Demo"** (blue button in the AI-Generated Content section)
3. All fields fill with realistic demo data (Test Setup + AI content + Metrics + URL)
4. Click **"Generate Briefing"**
5. A complete briefing appears on the canvas

This is useful for:
- Testing the plugin after installation
- Checking the layout without spending API credits
- Showing the plugin to teammates

---

## Workflow 3: Test Setup Demo + AI

Use this to test the AI flow with pre-filled input.

1. Open the plugin
2. Click **"Fill Demo"** (small blue button in the header area)
3. Only the Test Setup fields fill in (Client, Test Name, Page, etc.)
4. Click **"Generate with AI"** to let the AI generate the rest
5. Review the AI output, then click **"Generate Briefing"**

---

## Understanding the Generated Briefing

The plugin creates a frame on the Figma canvas with this layout:

```
┌──────────────────────────────────────────────────────────┐
│  TITLE BAR (navy blue, test name in white)                │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  SIDEBAR     │     CONTROL           REFERENCE           │
│  (light gray)│     placeholder       placeholder         │
│              │     (for your         (for your           │
│  - Client    │      screenshot)       screenshot)        │
│  - Test Name │                                           │
│  - Hypothesis│                                           │
│  - Problems  │                                           │
│  - Proposals │                                           │
│  - Reasons   │                                           │
│  - Metrics   │                                           │
│  - URL Rule  │                          [WeConvert Logo] │
└──────────────┴───────────────────────────────────────────┘
```

- **Frame size:** 2174 x 1465 px (expands vertically if needed)
- **CONTROL placeholder:** Paste your control screenshot here (480 x 950 px)
- **REFERENCE placeholder:** Paste your variation screenshot here (480 x 950 px)

### After Generating

1. **Add screenshots:** Paste your control and reference screenshots over the gray placeholder boxes
2. **Adjust if needed:** All elements are standard Figma layers — you can move, resize, or edit any text
3. **Export:** Export the frame as PDF or PNG for sharing

---

## Tips and Best Practices

### Writing Good Input for the AI

- **Be specific** in the Change Description — the more detail you provide, the better the AI output
- **Include data** in the Context field — analytics numbers, survey findings, or heatmap observations help the AI generate stronger problems and proposals
- **Keep the Goal focused** — one primary metric works better than multiple goals

### Editing AI Output

- The AI generates a solid starting point, but always review and adjust
- Add or remove bullet points in Problems and Proposals as needed
- The Reasons Why field uses cognitive biases — feel free to change the bias or explanation
- Metrics should match what you'll actually measure in your testing tool

### Working with Multiple Briefings

- Each "Generate Briefing" click creates a new frame on the canvas
- Frames are placed at your current viewport center, so scroll to an empty area before generating
- You can generate multiple briefings in sequence — they won't overlap if you scroll between each one

---

## Field Reference

| Field | Required | Filled by | Notes |
|-------|----------|-----------|-------|
| Client | Yes | User | Determines which research PDF the AI searches |
| Test Name | Yes | User | Appears in the navy title bar |
| Page | Yes | User | Homepage, PDP, Cart, Collection, Menu, Checkout, Other |
| Change Description | Yes | User | Describes what is being tested |
| Goal | Yes | User | Primary metric or objective |
| Context | No | User | Optional analytics or research data |
| Hypothesis | Yes | AI | Editable — structured "If/then/because" format |
| Identified Problems | Yes | AI | Editable — bullet points, one per line |
| What We Propose | Yes | AI | Editable — numbered proposals, one per line |
| Reasons Why | Yes | AI | Editable — "Bias Name — Explanation" format |
| Metric 1, 2, 3 | Yes | AI | Editable — three KPIs |
| URL Rule | Yes | AI | Editable — page or URL pattern |

---

## Common Questions

### Can I edit the briefing after generating it?
Yes. Everything on the canvas is standard Figma layers (text, rectangles, images). You can edit, move, or resize anything.

### What if the AI gives bad output?
Edit the fields directly in the plugin panel before clicking "Generate Briefing". The AI is a starting point — you have full control.

### Can I regenerate just the AI content?
Yes. Modify the Test Setup fields if needed and click "Generate with AI" again. It creates a new thread each time, so previous results are not affected.

### Does it cost money to use?
The AI uses OpenAI's `gpt-4o-mini` model which costs approximately $0.003-0.005 per briefing. At 100 briefings/month, that's about $0.50. The "Fill AI Demo" button lets you test the layout without any API cost.

### What clients are available?
Currently: **Nominal** and **Led Esthetics**. To add a new client, see the installation instructions.
