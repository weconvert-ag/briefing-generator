# Figma Briefing Generator — Documentation

## Overview

This plugin generates structured briefing layouts automatically inside Figma using pure JavaScript.

Instead of manually creating frames, rectangles, text blocks, and layouts, the plugin creates them programmatically using the Figma Plugin API.

This enables automation, scalability, and future integration with AI systems.

---

# Architecture

The system consists of:

```
Figma
 └── Plugin
      └── code.js
           └── Uses Figma Plugin API
                └── Creates frames, text, and shapes
```

Future architecture with AI:

```
User input / AI agent
        ↓
Structured JSON
        ↓
Figma Plugin (code.js)
        ↓
Figma layout generated automatically
```

---

# Core Concepts

## Figma Plugin API

The Figma Plugin API allows programmatic creation and manipulation of design elements.

Examples of elements you can create:

* Frame
* Rectangle
* Text
* Image
* Components
* Auto layout containers

Official reference:
https://www.figma.com/plugin-docs/

---

# File Structure

Minimal plugin structure:

```
briefing-generator/
│
├── manifest.json
├── code.js
└── documentation.md
```

---

# manifest.json

Defines how Figma loads the plugin.

Example:

```json
{
  "name": "Briefing Generator",
  "id": "briefing-generator",
  "api": "1.0.0",
  "main": "code.js",
  "editorType": ["figma"]
}
```

Key fields:

* name → plugin name shown in Figma
* main → entry point file
* editorType → where plugin runs

---

# code.js Explanation

## Creating a frame

```js
const frame = figma.createFrame();
frame.resize(1200, 800);
```

Creates a container for all elements.

Equivalent to manually creating a Frame in Figma.

---

## Creating shapes

```js
const rect = figma.createRectangle();
rect.resize(300, 600);
```

Equivalent to drawing a rectangle in the UI.

---

## Setting colors

```js
rect.fills = [
  {
    type: "SOLID",
    color: { r: 0.9, g: 0.9, b: 0.9 }
  }
];
```

Color values use RGB from 0 to 1.

Example conversion:

```
Figma color: #E5E5E5

Divide each channel by 255:

229 / 255 = 0.9
```

---

## Creating text

You MUST load the font first:

```js
await figma.loadFontAsync({
  family: "Inter",
  style: "Regular"
});
```

Then create text:

```js
const text = figma.createText();
text.characters = "Hello world";
text.fontSize = 32;
```

---

## Positioning elements

```js
text.x = 340;
text.y = 40;
```

This sets position relative to the parent frame.

---

## Adding elements to frame

```js
frame.appendChild(text);
```

This makes the element visible inside the frame.

---

## Adding frame to page

```js
figma.currentPage.appendChild(frame);
```

Without this, nothing appears.

---

## Selecting and zooming

```js
figma.currentPage.selection = [frame];

figma.viewport.scrollAndZoomIntoView([frame]);
```

This focuses the camera on the generated layout.

---

## Closing plugin

```js
figma.closePlugin();
```

Ends execution.

---

# Execution Flow

```
Plugin runs
   ↓
Create frame
   ↓
Create sidebar
   ↓
Create title text
   ↓
Create placeholders
   ↓
Add everything to page
   ↓
Focus viewport
   ↓
Close plugin
```

---

# How to Run

Inside Figma:

```
Plugins
 → Development
 → Briefing Generator
```

---

# How to Extend

You can add:

## Images

```js
const image = figma.createRectangle();
image.fills = [{
  type: "IMAGE",
  imageHash: ...
}];
```

---

## Auto Layout

```js
frame.layoutMode = "VERTICAL";
```

---

## Dynamic text from JSON

Example:

```js
const data = {
  title: "My briefing"
};

title.characters = data.title;
```

---

# Future AI Integration

Recommended architecture:

```
AI generates JSON
     ↓
Plugin reads JSON
     ↓
Plugin builds layout
```

Example JSON:

```json
{
  "title": "Experiment Title",
  "hypothesis": "Increase conversion",
  "controlImage": "url",
  "referenceImage": "url"
}
```

---

# Automation Possibilities

You can automate generation from:

* ChatGPT
* Claude
* Notion
* Jira
* Google Sheets
* Internal tools

---

# Benefits

Manual work:

20–30 minutes per briefing

Automated:

1–2 seconds

---

# Recommended Next Steps

Add support for:

* JSON input
* Image import from URL
* Auto layout
* Text styles
* Templates
* AI integration

---

# Summary

This plugin converts code into visual layout automatically inside Figma using:

* Frames
* Shapes
* Text
* Positioning
* Figma Plugin API

This enables scalable automated design generation.

---

# End of Documentation
