# Figma Briefing Generator — Documentation

## Overview

This plugin generates structured A/B test briefing layouts inside Figma. Users fill in a form panel with test details, and the plugin programmatically creates a complete briefing frame using the Figma Plugin API.

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
User fills in fields and clicks "Generate Briefing"
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
├── manifest.json       ← Plugin config (tells Figma what to load)
├── code.js             ← Main plugin logic (layout generation)
├── ui.html             ← Form UI panel shown inside Figma
├── wc-logo.png         ← WeConvert logo source file
└── documentation.md    ← This file
```

> **Note:** The root-level files are copies kept in sync with the `Briefing Generator/` subfolder. Figma loads from the subfolder.

---

# manifest.json

Defines how Figma loads the plugin.

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

Key fields:

* **name** → Plugin name shown in Figma
* **id** → Unique plugin identifier
* **main** → Entry point JavaScript file
* **ui** → HTML file for the form panel
* **editorType** → Where the plugin runs

---

# UI Panel (ui.html)

The UI panel is a form that collects briefing data from the user. It opens when the plugin runs via `figma.showUI(__html__, { width: 380, height: 720 })`.

## Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Test Name | text input | Yes | e.g. `GE\|MENU\|AB029 – Redesign Menu` |
| Hypothesis | textarea | Yes | The hypothesis being tested |
| Identified Problems | textarea | No | One problem per line (bullets added automatically) |
| What We Propose | textarea | No | One proposal per line (bullets added automatically) |
| Reasons Why | textarea | No | Format: `Title — Explanation` (one per line) |
| Metric 1, 2, 3 | text inputs | No | Three KPIs to measure the test |
| URL Rule | text input | No | URL or page where the test runs |

## How Data Flows

1. User fills in the form and clicks **Generate Briefing**
2. JavaScript collects all field values into a `data` object
3. `parent.postMessage({ pluginMessage: { type: 'generate', data } }, '*')` sends the data to `code.js`
4. Validation: Test Name and Hypothesis are required; other fields are optional

---

# code.js — Plugin Logic

## Entry Point

```js
figma.showUI(__html__, { width: 380, height: 720 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await createBriefing(msg.data);
    figma.closePlugin();
  }
};
```

The plugin shows the UI panel, waits for the user to submit the form, generates the layout, then closes.

## createBriefing(input)

The main function that builds the entire layout. It receives the form data as `input`.

### Constants

* **Colors:** NAVY (`#123D5C`), WHITE, LIGHT_GRAY, DARK_GRAY
* **Dimensions:** Frame 1400×900, Title bar 55px high, Sidebar 300px wide

### Font Loading

Three font styles must be loaded before creating text:

```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
```

### Helper Functions

* `createText(opts)` — Creates a text node with configurable size, color, bold, width, lineHeight
* `addSidebarHeader(text)` — Adds a bold 9px header to the sidebar (advances cursor)
* `addSidebarBody(text)` — Adds a regular 7.5px body text to the sidebar (advances cursor)
* `addSidebarSemiBold(text)` — Adds a semi-bold 7.5px text to the sidebar (used for numbered reason titles)

### Layout Structure

The frame is composed of these sections:

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

### Sidebar Sections

All sidebar sections use a cursor-based Y positioning system (`cursorY`). Each helper function appends content and advances the cursor.

1. **Test Name** — Always shown (bold header)
2. **Hypothesis** — Always shown (header + body)
3. **Identified Problems** — Optional. Lines split by `\n`, each prefixed with `•`
4. **What We Proposed** — Optional. Lines split by `\n`, each prefixed with `•`
5. **Reasons Why** — Optional. Lines split by `\n`, parsed with `—` delimiter:
   - If line contains `—`: title (semi-bold) + explanation (body)
   - If no `—`: just the title (semi-bold)
   - Each reason is numbered (1., 2., 3., ...)
6. **Measured By** — Always shown. Three metrics displayed as bullet list
7. **URL** — Always shown

### Content Area

Two columns side by side:
- **CONTROL** — Light gray rectangle placeholder with centered text
- **REFERENCE** — Slightly darker gray rectangle placeholder with centered text

Users manually paste screenshots into these placeholders after generation.

### WeConvert Logo

A base64-encoded PNG logo is embedded directly in `code.js`. It is decoded and placed as an image fill on a rectangle at the bottom-right of the frame.

```js
const logoBytes = figma.base64Decode(logoBase64);
const logoImage = figma.createImage(logoBytes);
logoRect.fills = [{ type: "IMAGE", scaleMode: "FIT", imageHash: logoImage.hash }];
```

### Finalize

```js
figma.currentPage.appendChild(frame);
figma.currentPage.selection = [frame];
figma.viewport.scrollAndZoomIntoView([frame]);
```

The frame is added to the page, selected, and the viewport zooms to it.

---

# How to Run

Inside Figma:

```
Plugins → Development → Briefing Generator
```

The form panel will appear. Fill in the fields and click **Generate Briefing**.

After making code changes, re-run the plugin to see updates (no reinstall needed).

---

# Key API Concepts

## Color Values

Figma uses RGB from 0 to 1 (not 0–255):

```
Hex #123D5C → r: 18/255 = 0.07, g: 61/255 = 0.24, b: 92/255 = 0.36
```

## Text Nodes

Fonts must be loaded before creating text. `textAutoResize: "HEIGHT"` makes the text node auto-expand vertically to fit content.

## Image Embedding

Images can be embedded as base64 strings, decoded with `figma.base64Decode()`, and applied as image fills on rectangles.

## UI ↔ Plugin Communication

- **UI → Plugin:** `parent.postMessage({ pluginMessage: data }, '*')`
- **Plugin → UI:** `figma.ui.postMessage(data)` (not currently used)
- **Plugin receives:** `figma.ui.onmessage = (msg) => { ... }`

---

# End of Documentation
