# Briefing Generator — Installation Instructions

## Prerequisites

- **Figma Desktop App** installed on your computer
- **Edit access** to the Figma file where you want to use the plugin

---

## Step 1: Download the Plugin Files

1. Go to the GitHub repository page
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Save the ZIP file to your computer

---

## Step 2: Extract the ZIP

1. Find the downloaded ZIP file (usually in your **Downloads** folder)
2. **Double-click** the ZIP to extract it (macOS) or **Right-click > Extract All** (Windows)
3. You'll get a folder called `Briefing-Generator-main` (or similar)
4. Move this folder somewhere permanent on your computer — for example, your **Documents** folder

> Do **not** leave it in Downloads, as it may get accidentally deleted.

After extracting, the folder structure looks like this:

```
Briefing Generator/
├── Briefing Generator/       ← This is the subfolder Figma needs
│   ├── manifest.json         ← Plugin configuration file
│   ├── code.js               ← Plugin logic
│   ├── ui.html               ← Plugin interface
│   └── wc-logo.png           ← WeConvert logo
├── code.js
├── ui.html
├── documentation.md
├── tutorial.md
└── ...
```

---

## Step 3: Load the Plugin in Figma

1. Open the **Figma Desktop App**
2. Open any Figma file (or create a new one)
3. In the top menu bar, go to: **Plugins > Development > Import plugin from manifest...**
4. A file picker window opens — navigate to the folder you extracted
5. Go **inside** the inner `Briefing Generator/` subfolder (the one that contains `manifest.json`)
6. Select `manifest.json` and click **Open**

Figma will confirm the plugin was imported.

> **Important:** You must select the `manifest.json` inside the **inner** `Briefing Generator/` subfolder, not the root folder.

---

## Step 4: Verify the Installation

1. In your Figma file, go to **Plugins > Development > Briefing Generator**
2. The plugin panel should open on the right side
3. You should see the form with fields: Client, Test Name, Page, etc.
4. Click **"Fill AI Demo"** to populate all fields with demo data
5. Click **"Generate Briefing"** to create a test layout on the canvas

If a briefing frame appears on the canvas, the installation is complete.

---

## Step 5: Run the Plugin (After Installation)

Once installed, you don't need to import again. To run the plugin in any Figma file:

1. Open your Figma file
2. Go to **Plugins > Development > Briefing Generator**
3. The plugin panel opens and is ready to use

> See **tutorial.md** for a full guide on how to create briefings.

---

## Troubleshooting

### Plugin doesn't appear in Figma
- Make sure you selected `manifest.json` from the **inner** `Briefing Generator/` subfolder
- Restart Figma and try again
- Make sure you're using the **Figma Desktop App** (not the browser version)

### "Generate with AI" doesn't work
- Check with your team lead that the OpenAI API key is valid and has credits
- Open the developer console (**Help > Toggle Developer Tools** in Figma Desktop) to see error messages

### Layout looks broken or fonts are missing
- The plugin uses the **Inter** font (Light, Regular, Semi Bold, Bold). Inter is Figma's default font and should be available automatically
- If you see font errors, try restarting Figma

### Plugin doesn't load after moving the folder
- If you move the plugin folder to a different location, you need to re-import it in Figma (repeat Step 3)
- Figma remembers the file path, so moving the folder breaks the link

---

## For Developers / Admins

### Editing Plugin Files

The root-level `code.js` and `ui.html` are the source files. After any edit, you must sync them to the inner subfolder:

**macOS:**
```bash
cp ui.html "Briefing Generator/ui.html"
cp code.js "Briefing Generator/code.js"
```

**Windows (Command Prompt):**
```cmd
copy ui.html "Briefing Generator\ui.html"
copy code.js "Briefing Generator\code.js"
```

Then close and reopen the plugin in Figma to see the changes.

### OpenAI API Key

The API key is in `ui.html` (around line 200):
```js
var OPENAI_API_KEY = 'sk-proj-...';
```

To change it, edit this line, save the file, sync to the subfolder, and reopen the plugin.

### Adding a New Client

1. Upload the client's research PDF to the OpenAI Assistant's **File Search** vector store at [platform.openai.com](https://platform.openai.com)
2. Open `ui.html` and add a new option to the Client dropdown:
   ```html
   <option value="ClientName">ClientName</option>
   ```
3. Sync: `cp ui.html "Briefing Generator/ui.html"`
