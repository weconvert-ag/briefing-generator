// Briefing Generator - Figma Plugin

// Show UI
figma.showUI(__html__, { width: 380, height: 720 });

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await createBriefing(msg.data);
    figma.closePlugin();
  }
};

async function createBriefing(input) {

  // ── Colors ──
  const NAVY = { r: 0.07, g: 0.24, b: 0.36 };
  const WHITE = { r: 1, g: 1, b: 1 };
  const LIGHT_GRAY = { r: 0.92, g: 0.92, b: 0.92 };
  const DARK_GRAY = { r: 0.2, g: 0.2, b: 0.2 };

  // ── Dimensions ──
  const FRAME_W = 1400;
  const FRAME_H = 900;
  const TITLE_BAR_H = 55;
  const SIDEBAR_W = 300;
  const SIDEBAR_PADDING = 16;
  const SIDEBAR_TEXT_W = SIDEBAR_W - SIDEBAR_PADDING * 2;

  // ── Load fonts ──
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  // ── Helper: create a text node ──
  function createText(opts) {
    const t = figma.createText();
    t.characters = opts.text || "";
    t.fontSize = opts.size || 10;
    t.fontName = { family: "Inter", style: opts.bold ? "Bold" : "Regular" };
    t.fills = [{ type: "SOLID", color: opts.color || WHITE }];
    t.x = opts.x || 0;
    t.y = opts.y || 0;
    if (opts.width) {
      t.resize(opts.width, opts.size || 10);
      t.textAutoResize = "HEIGHT";
    }
    if (opts.lineHeight) {
      t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" };
    }
    return t;
  }

  // ══════════════════════════════════════════════
  // MAIN FRAME
  // ══════════════════════════════════════════════
  const frame = figma.createFrame();
  frame.name = input.testName || "Auto Briefing";
  frame.resize(FRAME_W, FRAME_H);
  frame.x = 100;
  frame.y = 100;
  frame.fills = [{ type: "SOLID", color: WHITE }];

  // ══════════════════════════════════════════════
  // TITLE BAR (full width, navy background)
  // ══════════════════════════════════════════════
  const titleBar = figma.createRectangle();
  titleBar.resize(FRAME_W, TITLE_BAR_H);
  titleBar.x = 0;
  titleBar.y = 0;
  titleBar.fills = [{ type: "SOLID", color: NAVY }];
  frame.appendChild(titleBar);

  const title = createText({
    text: input.testName,
    size: 22,
    bold: true,
    color: WHITE,
    x: 20,
    y: 14,
    width: FRAME_W - 40
  });
  frame.appendChild(title);

  // ══════════════════════════════════════════════
  // SIDEBAR (below title bar)
  // ══════════════════════════════════════════════
  const sidebar = figma.createRectangle();
  sidebar.resize(SIDEBAR_W, FRAME_H - TITLE_BAR_H);
  sidebar.x = 0;
  sidebar.y = TITLE_BAR_H;
  sidebar.fills = [{ type: "SOLID", color: NAVY }];
  frame.appendChild(sidebar);

  // ── Sidebar content ──
  let cursorY = TITLE_BAR_H + 14;
  const sideX = SIDEBAR_PADDING;

  function addSidebarHeader(text) {
    const t = createText({
      text: text,
      size: 9,
      bold: true,
      color: WHITE,
      x: sideX,
      y: cursorY,
      width: SIDEBAR_TEXT_W,
      lineHeight: 13
    });
    frame.appendChild(t);
    cursorY += t.height + 4;
    return t;
  }

  function addSidebarBody(text) {
    const t = createText({
      text: text,
      size: 7.5,
      bold: false,
      color: WHITE,
      x: sideX,
      y: cursorY,
      width: SIDEBAR_TEXT_W,
      lineHeight: 11
    });
    frame.appendChild(t);
    cursorY += t.height + 6;
    return t;
  }

  function addSidebarSemiBold(text) {
    const t = figma.createText();
    t.characters = text;
    t.fontSize = 7.5;
    t.fontName = { family: "Inter", style: "Semi Bold" };
    t.fills = [{ type: "SOLID", color: WHITE }];
    t.x = sideX;
    t.y = cursorY;
    t.resize(SIDEBAR_TEXT_W, 10);
    t.textAutoResize = "HEIGHT";
    t.lineHeight = { value: 11, unit: "PIXELS" };
    frame.appendChild(t);
    cursorY += t.height + 2;
    return t;
  }

  // ── Test Name ──
  addSidebarHeader(input.testName);
  cursorY += 4;

  // ── Hypothesis (from user input) ──
  addSidebarHeader("Hypothesis");
  addSidebarBody(input.hypothesis);
  cursorY += 2;

  // ── Identified Problems (from user input) ──
  if (input.identifiedProblems) {
    addSidebarHeader("Identified problems:");
    const problems = input.identifiedProblems.split("\n").filter(function(l) { return l.trim(); });
    addSidebarBody(problems.map(function(p) { return "• " + p.trim(); }).join("\n"));
    cursorY += 2;
  }

  // ── What we propose (from user input) ──
  if (input.whatWePropose) {
    addSidebarHeader("What we proposed:");
    const proposals = input.whatWePropose.split("\n").filter(function(l) { return l.trim(); });
    addSidebarBody(proposals.map(function(p) { return "• " + p.trim(); }).join("\n"));
    cursorY += 2;
  }

  // ── Reasons why (from user input) ──
  if (input.reasonsWhy) {
    addSidebarHeader("Reasons why");
    var reasonLines = input.reasonsWhy.split("\n").filter(function(l) { return l.trim(); });
    for (var i = 0; i < reasonLines.length; i++) {
      var parts = reasonLines[i].split("—");
      if (parts.length >= 2) {
        addSidebarSemiBold((i + 1) + ". " + parts[0].trim());
        addSidebarBody("   " + parts.slice(1).join("—").trim());
      } else {
        addSidebarSemiBold((i + 1) + ". " + reasonLines[i].trim());
      }
    }
    cursorY += 2;
  }

  // ── Measured by (from user input) ──
  addSidebarHeader("Measured by");
  const metrics = [
    input.metric1 || "Metric 1",
    input.metric2 || "Metric 2",
    input.metric3 || "Metric 3"
  ];
  addSidebarBody("• " + metrics.join("\n• "));
  cursorY += 2;

  // ── URL (from user input) ──
  addSidebarHeader("URL");
  addSidebarBody(input.urlRule || "URL rule");


  // ══════════════════════════════════════════════
  // CONTENT AREA (right of sidebar)
  // ══════════════════════════════════════════════
  const contentX = SIDEBAR_W + 20;
  const contentY = TITLE_BAR_H + 16;
  const contentW = FRAME_W - SIDEBAR_W - 40;
  const colW = (contentW - 30) / 2;
  const imgH = FRAME_H - TITLE_BAR_H - 100;

  // ── CONTROL column ──
  const controlLabel = createText({
    text: "CONTROL",
    size: 16,
    bold: true,
    color: DARK_GRAY,
    x: contentX + colW / 2 - 40,
    y: contentY
  });
  frame.appendChild(controlLabel);

  const controlImage = figma.createRectangle();
  controlImage.resize(colW, imgH);
  controlImage.x = contentX;
  controlImage.y = contentY + 30;
  controlImage.fills = [{ type: "SOLID", color: LIGHT_GRAY }];
  controlImage.cornerRadius = 4;
  frame.appendChild(controlImage);

  const controlPlaceholder = createText({
    text: "Control Screenshot",
    size: 14,
    bold: false,
    color: { r: 0.6, g: 0.6, b: 0.6 },
    x: contentX + colW / 2 - 60,
    y: contentY + 30 + imgH / 2 - 10
  });
  frame.appendChild(controlPlaceholder);

  // ── REFERENCE column ──
  const refX = contentX + colW + 30;

  const refLabel = createText({
    text: "REFERENCE",
    size: 16,
    bold: true,
    color: DARK_GRAY,
    x: refX + colW / 2 - 50,
    y: contentY
  });
  frame.appendChild(refLabel);

  const refImage = figma.createRectangle();
  refImage.resize(colW, imgH);
  refImage.x = refX;
  refImage.y = contentY + 30;
  refImage.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.88, b: 0.88 } }];
  refImage.cornerRadius = 4;
  frame.appendChild(refImage);

  const refPlaceholder = createText({
    text: "Reference Screenshot",
    size: 14,
    bold: false,
    color: { r: 0.6, g: 0.6, b: 0.6 },
    x: refX + colW / 2 - 70,
    y: contentY + 30 + imgH / 2 - 10
  });
  frame.appendChild(refPlaceholder);


  // ══════════════════════════════════════════════
  // WECONVERT LOGO (bottom-right)
  // ══════════════════════════════════════════════
  const logoW = 140;
  const logoH = 44;
  const logoRect = figma.createRectangle();
  logoRect.resize(logoW, logoH);
  logoRect.x = FRAME_W - logoW - 16;
  logoRect.y = FRAME_H - logoH - 12;

  // Load embedded logo image
  const logoBase64 = "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";

  const logoBytes = figma.base64Decode(logoBase64);
  const logoImage = figma.createImage(logoBytes);

  logoRect.fills = [{
    type: "IMAGE",
    scaleMode: "FIT",
    imageHash: logoImage.hash
  }];

  frame.appendChild(logoRect);


  // ══════════════════════════════════════════════
  // FINALIZE
  // ══════════════════════════════════════════════
  figma.currentPage.appendChild(frame);
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
}
