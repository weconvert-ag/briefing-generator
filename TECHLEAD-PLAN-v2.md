# Tech Lead Plan — v2 AI Integration

## Status: IMPLEMENTATION COMPLETE — PENDING API TESTING

All code has been written and deployed. Blocked on Gemini API free tier quota during testing.

---

## What Was Built

### ui.html (self-contained, ~105KB)
- **New input fields:** Client dropdown, Page dropdown, Change Description textarea, Goal input, Context textarea
- **New CSS:** Styles for select dropdowns, AI button (green), AI status text, section labels
- **"Generate with AI" button:** Calls Gemini API, parses JSON, auto-fills 4 output fields
- **Embedded constants:** `SYSTEM_PROMPT` (~5KB from briefing-ai-assistant-generator.md), `CLIENT_RESEARCH.Nominal` (~80KB from nominal-research-text.txt)
- **No build step:** Everything is inline in a single HTML file — no Node.js, no backend
- **Existing functionality preserved:** "Generate Briefing" button and postMessage flow unchanged

### code.js
- **Only change:** Panel height `720` → `900` (line 4)

### File sync
- Both `ui.html` and `code.js` are synced between root and `Briefing Generator/` subfolder
- Figma loads from the subfolder

---

## Implementation Completed (Tasks 1-7)

| Step | Task | Status |
|------|------|--------|
| 1 | Add new HTML fields to ui.html | DONE |
| 2 | Add CSS for dropdown, AI button, status | DONE |
| 3 | Add AI button HTML | DONE |
| 4 | Embed system prompt + client research as JS constants | DONE |
| 5 | Add Gemini API fetch + form auto-fill logic | DONE |
| 6 | Update panel height in code.js | DONE |
| 7 | Sync root files to subfolder | DONE |

---

## Remaining Tasks

### Task 8: Test in Figma (BLOCKED — API quota)

The Gemini API free tier daily quota was exhausted during development/testing. The error:
```
Quota exceeded for metric: generate_content_free_tier_input_token_count, limit: 0
```

**To unblock, do ONE of these:**
1. **Wait** — free tier resets at midnight Pacific Time
2. **New Google account** — create a fresh API key at aistudio.google.com under a different Google account
3. **Enable billing** — add billing to the current Google Cloud project (even $1 removes free tier limits)

**Once API is available, test this flow:**
1. Open Figma → Plugins → Development → Briefing Generator
2. Select "Nominal" from Client dropdown
3. Fill in Test Name, Page, Change Description, Goal
4. Click "Generate with AI"
5. Verify: Hypothesis, Problems, Proposals, Reasons auto-fill with green borders
6. Review/edit the auto-filled fields
7. Fill in Metrics and URL Rule
8. Click "Generate Briefing"
9. Verify the Figma layout looks correct with all content

### Task 9: Commit to GitHub

After successful testing:
```bash
git add ui.html "Briefing Generator/ui.html" code.js "Briefing Generator/code.js" documentation.md briefing-ai-assistant-generator.md nominal-research-text.txt TECHLEAD-PLAN-v2.md
git commit -m "v2 - Add AI integration with Gemini for auto-generating briefing content"
git push
```

---

## Current Configuration

| Setting | Value | Location |
|---------|-------|----------|
| API Key | `AIzaSyB2oYgipMSdmTLQeFB9FzNJWVj8WClY6fc` | ui.html line 177 |
| Model | `gemini-2.0-flash` | ui.html line 178 |
| Temperature | 0.4 | ui.html, fetch body |
| Response format | `application/json` | ui.html, fetch body |
| Panel size | 380×900 | code.js line 4 |

### To change API key:
Edit line 177 of `ui.html`: `var GEMINI_API_KEY = 'YOUR_NEW_KEY';`
Then sync: `cp ui.html "Briefing Generator/ui.html"`

### Alternative models (if quota issues persist):
- `gemini-2.0-flash` — best quality, separate quota from lite
- `gemini-2.0-flash-lite` — lighter, separate quota pool
- `gemini-1.5-flash` — older, may have different quota

---

## Architecture Decisions

### Frontend-only (no backend)
- All API calls made directly from `ui.html` via `fetch()`
- API key stored in `ui.html` (acceptable: plugin is internal-only, WeConvert team)
- No Vercel, no Node.js, no server

### Self-contained ui.html
- System prompt and research text are embedded as JS string constants
- File is ~105KB (mostly the ~80KB research text)
- No build step needed — just edit the HTML file directly
- To regenerate from source files, a one-time Node.js assembly script was used (now deleted)

### Token usage consideration
- The ~80KB research text is sent on every "Generate with AI" call
- This uses ~20K+ tokens per request
- Free tier has daily token limits — heavy testing can exhaust it quickly
- For production use with frequent calls, consider: paid tier, or trimming the research text

---

## Adding a New Client

1. Extract PDF research text (copy-paste or use a PDF-to-text tool)
2. In `ui.html`, find the `CLIENT_RESEARCH` object and add:
   ```javascript
   var CLIENT_RESEARCH = {
     "Nominal": '...existing...',
     "NewClient": '...escaped text...'
   };
   ```
   (Text must be escaped: backslashes doubled, single quotes escaped, newlines as `\n`)
3. Add dropdown option in HTML:
   ```html
   <select id="client">
     <option value="Nominal">Nominal</option>
     <option value="NewClient">NewClient</option>
   </select>
   ```
4. Sync: `cp ui.html "Briefing Generator/ui.html"`

---

## Important Notes

- Both root files AND `Briefing Generator/` subfolder files must be kept in sync
- Figma loads from the subfolder — if you only edit root, plugin won't see changes
- The API key is visible in ui.html — acceptable for internal use only
- All auto-filled fields remain editable — user always has final control
- If Gemini returns unexpected format, error appears in AI status area
- Green highlight on auto-filled fields resets when user edits them

---

## End of Plan
