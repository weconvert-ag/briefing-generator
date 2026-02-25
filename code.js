// Briefing Generator - Figma Plugin

// Show UI
figma.showUI(__html__, { width: 380, height: 900 });

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    await createBriefing(msg.data);
    figma.closePlugin();
  }
};

async function createBriefing(input) {

  // ── Colors ──
  var NAVY = { r: 0.07, g: 0.24, b: 0.36 };          // #123D5C
  var WHITE = { r: 1, g: 1, b: 1 };
  var BG_LEFT = { r: 0.96, g: 0.96, b: 0.96 };        // #F5F5F5
  var BLACK = { r: 0, g: 0, b: 0 };                    // #000000
  var DARK_TEXT = { r: 0, g: 0, b: 0 };                // #000000
  var BODY_TEXT = { r: 0, g: 0, b: 0 };                // #000000
  var PLACEHOLDER_BG = { r: 0.92, g: 0.92, b: 0.92 };  // #EBEBEB
  var PLACEHOLDER_TEXT = { r: 0.6, g: 0.6, b: 0.6 };

  // ── Dimensions ──
  var FRAME_W = 2174;
  var FRAME_H = 1465;
  var TITLE_BAR_H = 80;
  var SIDEBAR_W = 548;
  var SIDEBAR_PADDING = 36;
  var SIDEBAR_TEXT_W = SIDEBAR_W - SIDEBAR_PADDING * 2;
  var SCREENSHOT_W = 480;
  var SCREENSHOT_H = 950;

  // ── Load fonts ──
  await figma.loadFontAsync({ family: "Inter", style: "Light" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  // ── Helper: create a text node ──
  function createText(opts) {
    var t = figma.createText();
    t.characters = opts.text || "";
    t.fontSize = opts.size || 16;
    var style = "Regular";
    if (opts.light) style = "Light";
    if (opts.bold) style = "Bold";
    if (opts.semiBold) style = "Semi Bold";
    t.fontName = { family: "Inter", style: style };
    t.fills = [{ type: "SOLID", color: opts.color || DARK_TEXT }];
    t.x = opts.x || 0;
    t.y = opts.y || 0;
    if (opts.width) {
      t.resize(opts.width, opts.size || 16);
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
  var frame = figma.createFrame();
  frame.name = input.testName || "Auto Briefing";
  frame.resize(FRAME_W, FRAME_H);
  var viewCenter = figma.viewport.center;
  frame.x = Math.round(viewCenter.x - FRAME_W / 2);
  frame.y = Math.round(viewCenter.y - FRAME_H / 2);
  frame.fills = [{ type: "SOLID", color: WHITE }];
  frame.strokes = [{ type: "SOLID", color: BLACK }];
  frame.strokeWeight = 1;
  frame.strokeAlign = "INSIDE";

  // ══════════════════════════════════════════════
  // TITLE BAR (full width, navy background)
  // ══════════════════════════════════════════════
  var titleBar = figma.createRectangle();
  titleBar.resize(FRAME_W, TITLE_BAR_H);
  titleBar.x = 0;
  titleBar.y = 0;
  titleBar.fills = [{ type: "SOLID", color: NAVY }];
  frame.appendChild(titleBar);

  var title = createText({
    text: input.testName,
    size: 40,
    bold: true,
    color: WHITE,
    x: 28,
    y: 18,
    width: FRAME_W - 56
  });
  frame.appendChild(title);

  // ══════════════════════════════════════════════
  // LEFT PANEL (sidebar — #F5F5F5, full height)
  // ══════════════════════════════════════════════
  var sidebarBg = figma.createRectangle();
  sidebarBg.resize(SIDEBAR_W, FRAME_H - TITLE_BAR_H);
  sidebarBg.x = 0;
  sidebarBg.y = TITLE_BAR_H;
  sidebarBg.fills = [{ type: "SOLID", color: BG_LEFT }];
  sidebarBg.strokes = [{ type: "SOLID", color: BLACK }];
  sidebarBg.strokeWeight = 1;
  sidebarBg.strokeAlign = "INSIDE";
  frame.appendChild(sidebarBg);

  // ── Sidebar content — start 90px below title bar ──
  var cursorY = TITLE_BAR_H + 20;
  var sideX = SIDEBAR_PADDING;

  function addHeader(text) {
    var t = createText({
      text: text,
      size: 18,
      bold: true,
      color: DARK_TEXT,
      x: sideX,
      y: cursorY,
      width: SIDEBAR_TEXT_W,
      lineHeight: 19
    });
    frame.appendChild(t);
    cursorY += t.height + 4;
    return t;
  }

  function addBody(text) {
    var t = createText({
      text: text,
      size: 16,
      color: BODY_TEXT,
      x: sideX,
      y: cursorY,
      width: SIDEBAR_TEXT_W,
      lineHeight: 19
    });
    frame.appendChild(t);
    cursorY += t.height + 10;
    return t;
  }

  function addSemiBold(text) {
    var t = createText({
      text: text,
      size: 18,
      semiBold: true,
      color: DARK_TEXT,
      x: sideX,
      y: cursorY,
      width: SIDEBAR_TEXT_W,
      lineHeight: 19
    });
    frame.appendChild(t);
    cursorY += t.height + 2;
    return t;
  }

  // ── Client Name ──
  var clientName = (input.client || "CLIENT").toUpperCase();
  addHeader(clientName);

  // ── Test Name ──
  addSemiBold(input.testName);
  cursorY += 10;

  // ── Hypothesis ──
  addHeader("Hypothesis");
  addBody(input.hypothesis);
  cursorY += 4;

  // ── Identified Problems ──
  if (input.identifiedProblems) {
    addHeader("Identified problems:");
    var problems = input.identifiedProblems.split("\n").filter(function(l) { return l.trim(); });
    addBody(problems.map(function(p) { return "\u2022 " + p.trim(); }).join("\n"));
    cursorY += 4;
  }

  // ── What We Propose ──
  if (input.whatWePropose) {
    addHeader("What we proposed:");
    var proposals = input.whatWePropose.split("\n").filter(function(l) { return l.trim(); });
    var proposalText = "";
    for (var i = 0; i < proposals.length; i++) {
      if (i > 0) proposalText += "\n";
      proposalText += (i + 1) + ". " + proposals[i].trim();
    }
    addBody(proposalText);
    cursorY += 4;
  }

  // ── Reasons Why ──
  if (input.reasonsWhy) {
    addHeader("Reasons why");
    var reasonLines = input.reasonsWhy.split("\n").filter(function(l) { return l.trim(); });
    for (var i = 0; i < reasonLines.length; i++) {
      var parts = reasonLines[i].split("\u2014");
      if (parts.length < 2) parts = reasonLines[i].split("—");
      if (parts.length >= 2) {
        addSemiBold((i + 1) + ". " + parts[0].trim());
        addBody("   " + parts.slice(1).join("\u2014").trim());
      } else {
        addSemiBold((i + 1) + ". " + reasonLines[i].trim());
      }
    }
    cursorY += 4;
  }

  // ── Measured By ──
  addHeader("Measured by");
  var metrics = [];
  if (input.metric1) metrics.push(input.metric1);
  if (input.metric2) metrics.push(input.metric2);
  if (input.metric3) metrics.push(input.metric3);
  if (metrics.length === 0) metrics = ["Metric 1", "Metric 2", "Metric 3"];
  addBody("\u2022 " + metrics.join("\n\u2022 "));
  cursorY += 4;

  // ── URL ──
  addHeader("URL rule");
  addBody(input.urlRule || "URL rule");

  // ── Dynamic resize: expand frame if sidebar content overflows ──
  var sidebarBottomPadding = 30;
  var requiredH = cursorY + sidebarBottomPadding;
  if (requiredH > FRAME_H) {
    FRAME_H = requiredH;
    frame.resize(FRAME_W, FRAME_H);
    sidebarBg.resize(SIDEBAR_W, FRAME_H - TITLE_BAR_H);
  }


  // ══════════════════════════════════════════════
  // CONTENT AREA (right of sidebar — white bg)
  // ══════════════════════════════════════════════
  var contentAreaX = SIDEBAR_W;
  var contentAreaW = FRAME_W - SIDEBAR_W;

  // Calculate positions to center both screenshots with gap between them
  var screenshotGap = 80;
  var totalScreenshotsW = SCREENSHOT_W * 2 + screenshotGap;
  var screenshotStartX = contentAreaX + (contentAreaW - totalScreenshotsW) / 2;

  // Labels Y position
  var labelY = TITLE_BAR_H + 25;
  var screenshotY = labelY + 45;

  // ── CONTROL column ──
  var controlCenterX = screenshotStartX + SCREENSHOT_W / 2;

  var controlLabel = createText({
    text: "CONTROL",
    size: 30,
    bold: true,
    color: DARK_TEXT,
    x: controlCenterX - 70,
    y: labelY
  });
  frame.appendChild(controlLabel);

  var controlImage = figma.createRectangle();
  controlImage.resize(SCREENSHOT_W, SCREENSHOT_H);
  controlImage.x = screenshotStartX;
  controlImage.y = screenshotY;
  controlImage.fills = [{ type: "SOLID", color: PLACEHOLDER_BG }];
  controlImage.cornerRadius = 4;
  frame.appendChild(controlImage);

  var controlPlaceholder = createText({
    text: "Control Screenshot",
    size: 16,
    bold: false,
    color: PLACEHOLDER_TEXT,
    x: screenshotStartX + SCREENSHOT_W / 2 - 72,
    y: screenshotY + SCREENSHOT_H / 2 - 10
  });
  frame.appendChild(controlPlaceholder);

  // ── REFERENCE column ──
  var refX = screenshotStartX + SCREENSHOT_W + screenshotGap;
  var refCenterX = refX + SCREENSHOT_W / 2;

  var refLabel = createText({
    text: "REFERENCE",
    size: 30,
    bold: true,
    color: DARK_TEXT,
    x: refCenterX - 88,
    y: labelY
  });
  frame.appendChild(refLabel);

  var refImage = figma.createRectangle();
  refImage.resize(SCREENSHOT_W, SCREENSHOT_H);
  refImage.x = refX;
  refImage.y = screenshotY;
  refImage.fills = [{ type: "SOLID", color: PLACEHOLDER_BG }];
  refImage.cornerRadius = 4;
  frame.appendChild(refImage);

  var refPlaceholder = createText({
    text: "Reference Screenshot",
    size: 16,
    bold: false,
    color: PLACEHOLDER_TEXT,
    x: refX + SCREENSHOT_W / 2 - 80,
    y: screenshotY + SCREENSHOT_H / 2 - 10
  });
  frame.appendChild(refPlaceholder);


  // ══════════════════════════════════════════════
  // WECONVERT LOGO (bottom-right)
  // ══════════════════════════════════════════════
  var logoW = 180;
  var logoH = 56;
  var logoRect = figma.createRectangle();
  logoRect.resize(logoW, logoH);
  logoRect.x = FRAME_W - logoW - 16;
  logoRect.y = FRAME_H - logoH - 12;

  var logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAALMAAAAsCAYAAAAuJIllAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABmkSURBVHgB7VwHeFRV2n6nt0xNMukhnRBEBFkQIwkgiqAgAUQQdVcsa8EKunbXrmBDV9dVFF0VFRBQsSFKFQWkhiolvU/KTJJJmXL/75wpmfRQ1ud/eOaF+8zce88599xz3/t933m/MxEJBAQRxFkAMYII4ixBkMxBnDUIkjmIswZBMgdx1iBI5iDOGvxvyMwFkqBIEsSfCylOEQL9E9E/huKmWiwt3YNva47D0mxDg7MZEImgl6pgVumQE9of0yMHwazU8fJuqiv21g0iiDMF0cnqzG5OYnAirynbh8eO/4Q91iJIZWqEyFR0QuwnKisrCG7UtzbC7WpFtikZL6WNxzBTkrcdUZDSQZwxnBSZ3fSPUbWOyJm17W3kNlRCrzJAJZbA3UszYrLU9S4HGsmKjzGl4MfhN0EilvrbDCKI00Wfyewi0kmIdFssRzFm+9tQqYxQS+Q42QSihEhd52iCjEKR3Zn3IinEHCR0EGcEfWIQCwkYkX+sOIBRv74BkyYCarEMp5IJd1EdnVQJiUKP1I3P44CtlBPZ3cuE0e12d3nc6XR2vobL1ady3bbZRf2TRXCVwJ+PPlvmI7YypG9aiAhd5Bl7UIzA1oYqVF7yJAzykF7LHzh4BB989BnCwkLR2tKCtNRkXH3VlC7L/rxhCzZu2gqpVIrkpARcM3Nqt23+95PPYTSa0GS3Y8Tw8zHxsotxqmAviFgs5mO07ufNWP3VNzhw+Cga7eSNZFL0i4tFVuYIzJwxBUaDgcrTZFgcnDn4wMaPbU6ni2kIfBxlMhl9F/Fx7Qm9kpkrDzTgpnWPQiTXQyY6PdGNqSDsP+sce4QNFEcnkaXelzWfW20WhnRZj87VWa0whUZCLNFQE05otTrUVhV42upQ79zzL8L+vXvI98igVsthqynrcjAmT78ea75cQfVVcDtq8PW3P+KKCeNwKvARee1PGzB79o2wVBZBojRBKld6+yfA5XDC0WKje3fh3vvm4+UXn/TWDZLah4Uv/wuPPPIolGo9WppqsGDBy7j7zlt6rSfuvYAI8w9/hQZS8U6XyIyoNa12HjMzPYS1paW4e39jFd7J39otkRkYGZglGzV2AhQaHfRh0bDV1eLo0eOdiGy12nD48GHozXFULhKN1jrsP3CoU5ss9Fj343fQh/ejLQIafQQmjh+LU4GPyFNnzsH4cePgEMlgjEqBjiy+UqWEXCGHXKmERqeFITwGpshELHp9EcKjElBcUhokcgCkchmFemSgFCo4HBLI5H1TkHskMyOblZSLRQVbYVKG9InI3Rl6RtSy+kp8MHAKDmfejcr6ci7MMcsfpjbhwaM/ECF6j1X/NvsqNNVbPJ0nq7ti9Redyvy6fScc9gY/yaWkdS/5aFmncr9t34UmWz0v12SzYur0q3t1ZV2BxeisXs6Mv2H1F8sRGtuf77OXpbY8D47GeiilEkjcTtSVF1D/bZy8YsgQFR0Lc3gYgmiD56mJuQIG39YHiHtr9LXCreTWFb3GyVJmdR12WGnrKNNJOZHL8WrGZFwbPRRJRN7dWfNQ0VDGr8I6UetqxneVB9AbLp84Dj6+qfShWLZiNf8e2L+ly1ZCERLqP6amcitWrOpU7rNlq4joev69uaEat8yZhVOBRCLB+x9+itXLPyWL248nQBvq6qCSubF+/U+wVBxDaUEuKkoOIz/vD0yaNBFVhQeRcU4G9u3cwuP6IE4fvZqhD4p+h06u6bEMs7qlNJF7NeUSFGc9AKu9mse/Iv+5SryYPgn3JGZRpChwme88XQz2jbofjURiZp01ci3eKdnV43UYESPMZiSmpHO3rlDKkbt7Bw8rAvH9N2ugDNG23STrQ1EeSkvL2oUkLD5Whuh5W1pTOIYPG+q/TqDS0draiubmZv8+Oxf4UrjIAt9z730wRCXxc3ay8okJsSgr/AOjsy4kGVPFCS8j0sbHx2D50nfx3ocfYduWtf7wJLBtf7tk8e1Nze3UmcDz3akxvr4xVcbhcPiPOzv0OxBswhWIrtpmdTuODfveRGMTqBYFnu9KRQosx8a2I0xGA13HU08gb20yGDvV6wo9krm0uQ4FLVaPue8G3Oo2VOCfqZdgbsJFCFOE4NDoBzmhwS1yBZ5Jm4AHksdwIksC8n5i2nN6O6aRyrC5roD2u795HxFvnHM9Gqor+KSJWfblK7/m59hz2n/gMKrKijlBXN6H6Tknxjffr/O3VVhUgsLjB7nC0NRox+js0ZDL5bwOK9/S0oo75z2ChLShMEelIjI2HXGJgzDn1nths9l4GZe371989S3qa63+/rmcdnrJtvj71PEe2DXmXH8Nv56PyD6SsP2vv1mLkVmXIyImDVEUskREp2Hw8LH48ONlHqUEbTH6H8dO8MnuxROmY0TWRDy/8HWUlJRhxEWXUb1UmGlLSB1Kis0ySKk8u/66nzdhwKDhuHjiVcgadyWumn0zeQeJv4++tsdNmIYxl03j5QYOGcnHzKcqbP99N8ZeNh2RcemIjPH08Zwh2dTHz/l53wvPvM7Nt89D5thJvI/nDBmF8opKXHfjnbwu619i6hA89NhzvMz4SbPwwitvQWM0e3hhisAzCxfx44OGXoTfd+7pPhQUesDmqiMCvn9QMG94ocsteuOLAr69X3jkyLe8vEtw843hRGOVgJV/F148tp7vO90ufxmGndYiAWvuEyIC2hPRfl5jdU9dEogIQkUltQ2ZYIoeIKgMCcKocVP85x96/FlBoggV9FHpQkzyUCE54wJBH9lfUOriBRpMf7nX3nhXEMl1goHKQawWPl/xpf/c+o2/CBKZRpDITUJIeKqgNafRlso3mcokiKRq4Zdft/vLT5t5o6AIieFtSVVm4e55jwonC3Zf9AIJQ0eMpnuTCmpTIr+uLqI/bWmCOjSZjiuFlPTBAqk6/no79+zj5ZX6foJCGycY+w0SRBKtoDL24/XYxu6Bjdf0WTfxOs3NLYJKFy4odFSH6kGsFMrKytv1Z9feXKY58Xalqmghuf/gtvudNYfOielcvH9ctHQdTZinj+eel8nvh20Mf7lwvCBRmnlbGlOCoNLHCVJlGO8bfzbGREGm0PJ7VNBz0oSlCKaYAXw8jfSMWbvsOLuHn9Zv6nYMe7TMBWSZRSJJl+ek3tDiAQodmOX1LR4Seyd1ieowVExYSBZ5tCfpIhJ7M30i5JJmPWzzqwjXmNu/WBIZSind3RPYW8kmTKkDh6CFrK5cqcDO7dvQTLozw5rv1kEeYkAz6bqXXToac2+7geLXaqhCNPhl82ayuJ5y/1m8hGJpM7c0ErJK48eN5sd3783FmOyLoA2Lg9EchcZaC5qtFrQ01qLeUg5taBQpH/HIHDkcJ/LyeZ3c/QchVar4d2dTIyZOODmd2mcJ0wcORm7uQZjIIispNGHhS6OtDi3kipV0n6aYJBSX1iAuob8/9GDjSg+ZZCwV1NoQCodaEUJ9bGmo5+EOC2+Y1Q2NTcOKTz/A58tXQ0HKyk033wxnix0qqicWy7F81Zp2fVrw8ps074iGSqOme6rBwhef48cnTbsOq5YvR1hcBiQyOeori/lku76qFA4KN8LjU3DojyMYNnKs34IqVArIlGreRzmNk0KtgViuIm9m8YQhjnqsW/s97DXFNBZOrxDg8XLs+TAP7HYxj+3qMbnWI5krW5u7XAjE4+BGC/6RlE2x8BWdVsGJvbKbWan173vKiHG4oRyDt7yCMCKyuKPURw+mztmEvuCqaVeiqa6O36zdVotdu/fCSu7/YO5uKEjaaWmsQ+YFwzD58vFw0UvJ0NxQgx3kpqpranAodw8UJMY3EemzLx4Pvd6zou/yK3IQEp4MKZHAUpyHl156FrWWQtRWFuCTT5agptQTwpBHQM5V1/M6VmtNm5ume4gID8fJgLX3z6cXIC+/GFpjGCS0X1NWiNTEONx26404/9yBdN0Cz3VDQtDU5MS0WTfxuh0frZOILxW58Mwzj+PW226EtbLcH3KpTfF4fsEiXm7+3beT5m3j59TGCLz19nue9rzhzg/ffUfziRD+PTwqEjlXTsR6SkStWbkUxsh42BsaoZZLsDd3B2n9J1BRdgKZlAyqraogOdKM3Tu24osOLwgDu7e6igqMG5uFJ598FCEKN1avXIa0/inIzB6HaVMn45yM/nSPnjlKU1MTBg5IxXR63pmjJ8JsCu1+IIUe8GbeZkH8wyNdhhZ37l/lcY/esMH3yeALKfwu1HvuaEMVDy3C1r/QLrzwbfj+IWFtxSGhLzhw4BB3acwVSdRm4eEnnhN+37mXZp0q7poowyNQjMddnTEikdxZOoUaccId9z4sbNuxi94sjWD0hhifLlvJ2/xyzffUpoLXF8sMwhtvLe503Vdf/zeFGUbPNSQqgQZdSB5wPneZPGSBhtrfKZwsTOZ4v1uFVC888fSCduffff9juiclud8MKpPBwyArhRt7cw/QNVW8LnPZKm2UQDG9vx5lQqmelp9nm9YUJ9A8gp8bkXkpD2f4NcmFHz12nB//ddsO2pd7xkFuEB5/6kV+PHPsZB6usdBHrg73txOIyPgBFNakCCEUGgwaMqqtHoWD/Fkpw4V75j/WqR7NP/zfl36+kp6LLwTU0vNZ1b6syyV0hR41oVhKMQfKbFwrpondHXEj8TrpxT6L7PvcYyvFRyU78fKASXAKbrIQYv+543YLBmx8ESZNOLXTTfKFXEyEd81zT6B+o396GgwRUXxfqzfhhx83orLSQq4xjFuhpNRzERcbzc9PmDABy5avIpcZgs1bfkMdJVu4dEfnZAolLhmbzct998NPXKpj7cvUOnz5zY9Y9sUaGgM3/8EB8wJMIVBqDR5VgA7n5RcgNa0/SjZu5ckRilmwj0IFnzLSF7BwpaaqDIbIZD5hjYuLxz8fvd8ffrhcbtx0w2wsfu8j5B46yhMwLoeAXXv2IzKyLVSz00R24mWXUmZU61ctxmRlItQcgVZqS+KbmHnLv/bKsxg54kIoolP4WpkPP16Op5/4B/797oeQa0yeR+Joxa03/ZX36+C+XAoRVLzt0MhYTJkxB7b6en/Io9GoaIx1sLewUFGEwuIiL2/aAgBXcwOFfnN4G4HKUqDIUF1D9b3hrUgsQU1t+9Czuwlgj2ROImLAqy6wS1laG3BN5Hn41zk5nYjMlI8LtryKFjoSTgPzYFIWHBT7yKgzRU11yNiwADrSl2UisSel3QUoA494pQG9gce5tF09Yzree++/CNEbcYQygbn7DyGEMmzW6jLcdfscf/mZ0ydj6YdLyOAZcCK/EIf/OA6tLoS7MhanhoZ6HhxNLCGSKvh3DbnYTb9s47EaV1882WgaYwlUlMnzKBkC1bHQyzAKa7/9npNZpTPh7Xf+S+S7lpNQIuk9CVNRQUkgQc6/tza34DyS8xh8D83XxqhRI/H7rt1EZhNP01dZLP4X1j82AWPEwMgrCjguFrWtIb9g+DBExKUQ+ZxQ6gz49PMVnMxfr14FNe0308sxauwliIqKQAOFFUyCU4R4FBi73Y61P66HwJcSeNojB0zxsZK/NC4W9zo8spsoMLspFnW5/OBMoMeRTqa4lq+Oo+8t1LlkItrH583iVjeQyJXNNiST1VURWaNDIvEQpb/fyN/CiZxvr0HShuehURuJyJJuicxku4SQcBjkavQVt5PFcNo98TCTgNQ0WWEPz9Vsx+wZOf5y2aMu5BZY8EpFarIujGhNNgtmX922AElL2rTgtTKsHZ1KTvo3EKIUU2zHNhF0SgnkYicUFJcq1Gro6OWZMW0yPUg7f0Aqepg7t23C8i++4iTsqIlygx5wjPWJtUHRLt+XUBxfQhKYrw++Mgx5BUXUf4W3ohN6nc4vD/rAvUi76wk9Zm7vmvt3NNZYIKfrFhcV4eXX3kJttSeWbrIW483XnvOOL00kScb0MZct/tFpJND6x0YMrUoCtUwEhdgNJY1RqMlr3TtkdoX/0YrCHsmsksgxkiYNLWSdFWIpjhIx5x5czcMHH6EtrfWI//kZKBU6esASfjwqJAJ3UbmFeZsx7Nc36CYNkPdAZAZbqx0zzQPRV7CWMjLSERoV325w2MzXHB2H/jSh8IGRJWPQYBLo2xIIXAN2NJJ1n+Kvf8Hw8+FqtfLvdeX5+PTjd1FnKSLd+jgs5SdQxbayY6gsOUrZvD9o4lmFoecNQmxMNLLHXEbKQy3vV2hMCmZMn4ovVq/p5BIZF9ikJiXjfCx6613ej+SkfuSePZNlplrs2v4bTWj3+euyMoWFxfji88/IYnpXF9I4D0hPRWtLK04V7L7n3so8WBO/hpq8yvyHnqb+x3GdPan/EAyiLCUrpyRvlJCYSMbWwUMtpoRYaIx8Y8PHh75X0rhUlh6l7Tjyj+3zXgd/Cnr1gU8mj4WN5DL2PrLf8L1Z+BvmH17DCV3abEXCz8+ShTIQkdvCB5rwkYWOwMPH1pKpUfRKZOb4HM5mzIkbhr6C9YdZiyuuIBLVW/3HmxsbMGp0Nj2c9rc2e9YMtNiq/fsOcoEDBl+AhPhY/7Ebrp8JJkowEpmik3Dp+MnYSaRi8hY7xj4XL1mK1PTzOmXtvv36UzKWjVxqYjFkKCUSpudchQxKEjz+5At49/2P8Mrrb+Pqa2+BkWS/khIL7rnjNnxASQZGlEk5OSRVsf4J0FM8OnzkGDxHyYINm37Bv/69mF7G4SS5RfO32EHhEXs542Jjuly73fdBFPEXffrMv6LeWsdJa6DsG/NajXUVuH/eXG8xjzW+ec61sNeVcive2NCEC8dcwcuysWAb6dcYkTme7vM/fgXF/7D+BPQYM7MwItOUglTSjC1EUBbTRlEo8XLeRsrYKbC4aAekZJGVImknsjILbfKuUe6ZyGwZaCtG6uORoA6HgJO792spTPhw8WIyv55Yu5X04KtJ3umI62ZNw4MP3OfNyglkVWswu8PDYlbxldfewJ23/Z101P4wkM48bOgwZAy9EJER4ThAenJFST5ppRoMpmzUtq3rOBG5ZEafuXt3IT09g/TrGK6pGqMTkV9Uhmeff4WI3sInMxIKozQkhbFr6owDccN1M4mUUVjyziKsXLaUXjI9d+FakxmPPfYU3K1NEEuURGQzvbwsbAERrRDf7duM04VvnJ94+D4s+/h9iHSeyS+7H5YZvX72DP9Ejb2wd91xM154YSFqSQLVh4Zi547d1M9IjMzM5l7v9982UChvwPatP/F7uPO2OfgzIe75pOd2PzhnOmopZc0mXWzNRRTF0s/nb0YT7SvFUginsTCUDVQjKSTLh8z2/uK772ADfVHmBXzi5Q81qL1LLs7uVJbN+hNJ4WAJCFaWkeSaq3PalWEPbO6tN2DuvfNhKTrALY2RZvosjfvb9t1oanWSxtqP9/LQoT0oK69sV7d/WgpKigtgDlWRTpzPEzlM89aRNqo3R0MXFkGJDY/SUG+tRWXBATz17EsYmz0KakqSHDm8n5Id1ZTksfBx0BGhDXQ9XXgEj7/rKQlSV3YUW3/dhvi42HbxML9/l7sbly7408sud+eYOmNAGnmpYfx+ed9qKzDnxpv43ML3ovMUNZ07cXQf9FopqssLodLqKDQxk3a/F/to8q0xxkKuUnMlYsWKL9uuwZIegm9dSNfrKjp0l5fj5bmShD6h1zCD3cCFYSmYE/sXVNFEjxGchRFGmaZHZaIvYC9HeWM1FpGUF6MynnRLbKCZZZwwKQdOssgOuxV/ycyCwaDvcpIxdcpEuOnFcbc0Ijl1ABIT+rUr53ONb7zyHDZs3IzEfnGoJ2WkoaoQ9uoS2OiTLefMybkSNspeJdB5z/oQ+NcjRFGCIe/YQby3ZDGSEuJokllNBDxBWz5tedReCURuByUBpqCgIB+PPTzPQzIiYlJiAmoqCzF1ag5a7TZvvTy+sSzkxWOyST0pw0hKBvnWkLDrS2QUxlHYJJc54QxYWNQGUjScDl5GJu08hgwPPnAvjWEFuVQHPVcXnnhkXqcxZCUVCgXKik5g3rz7IKdJa11FAR+bRppb1FuKYdAq8d77S7Dxpy/bwgzyvDK39/rU1+4WCvngYnM0mcDLS6l8x0VQ3aFPP5vyqRbnbFqA4zRRY4qDWzh1EjMwIlc1WTHWmIAfht98yn9LwzcwbMLCHgyLo30xXMdyLDZvbm3hnz5X2pVEFLiSzWKpIb20mMt47McBCURQZkV9w9Zb/bo6K6Wgy2Cz1XMiRFAqPoJCFuaGBe8qtMDFRr59tkrvxIkC1FCWU0tpakZ0LaXkA8vwP7VD12Lexie4MRmMrc7ztcnI3n5lmsD7EdhvX3/tlA31yYCsTEctuGN5RlbmtcrJQ4kpBIqLjiIPGOF/sX2fjIy+FDVrk6XTu9OKfR6klS0Q8+qhUu/9nPbPpvwXYc6Vip67aSEOk94crtDykONkwbrHtM5yUkYuNybh6xG3BP8oTBBnBH3+WQVfb0EkzM3+B6aFpvGlnQ7h5EjISGwnF1JmK8PDiVlBIgdxRnEKf9HI8zcufrMcxbX7V1CauoYye0auMbM3o2NjjKbMwbS6HLBRlnCoLhafDJqOdH2sf31zEEGcCZw0mRkC/2jL2spDeCpvPXKt5bBRoM9msj6Jl8dctBkp+XK+sR+eSxmHYYZ4bxtBixzEmcUpkdkHNvXyxSl2SnoUk5U+Zreg0tHMM10xpDMnkUYdS9q0XCztVCeIIM4kTovMQQTx/wlBIxnEWYMgmYM4axAkcxBnDYJkDuKsQZDMQZw1kDocDieCCOIswP8BjjwbyXSECMIAAAAASUVORK5CYII=";

  var logoBytes = figma.base64Decode(logoBase64);
  var logoImage = figma.createImage(logoBytes);

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
