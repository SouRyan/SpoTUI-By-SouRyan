(function () {

const style = `
:root {
    --spotui-accent: #ff8c42;
    --spotui-accent-rgb: 255, 140, 66;
    --spotui-accent-hover: #e07b39;
    --spotui-accent-light: #ffb26f;
    --spotui-contrast: #000;
    --spotui-bg: var(--spice-main, #0a0a0a);
    --spotui-surface: var(--spice-card, #111111);
    --spotui-text: var(--spice-text, #dddddd);
    --spotui-muted: var(--spice-subtext, #b3b3b3);
    --spotui-dim: #777777;
    --spotui-error: var(--spice-notification-error, #ff5555);
    --spotui-divider: var(--spice-button-disabled, #333333);
}

#spotui-tui {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 90px;
    width: 100vw;
    background: var(--spotui-bg);
    color: var(--spotui-text);
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 15px;
    padding: 40px;
    box-sizing: border-box;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    user-select: text;
    cursor: text;
}

#spotui-backdrop {
    position: absolute;
    inset: 0;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0;
    z-index: 0;
    pointer-events: none;
    transition: opacity 300ms ease;
}

/* Only paints on the logo screen; the log needs the plain background to stay readable. */
body.spotui-command-mode #spotui-backdrop.visible {
    opacity: var(--spotui-backdrop-opacity, 0.35);
}

#spotui-logo {
    position: absolute;
    left: 50%;
    top: 41%;
    transform: translate(-50%, -50%);
    color: var(--spotui-accent);
    opacity: 1;
    white-space: pre;
    text-align: center;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 28px;
    line-height: 1.0;
    pointer-events: none;
    user-select: none;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.spotui-ascii-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: clamp(9px, 1.4vw, 22px);
    letter-spacing: 0;
    font-weight: 400;
    font-variant-ligatures: none;
    font-kerning: none;
    -webkit-font-smoothing: antialiased;
    user-select: none;
    white-space: pre;
    padding: 20px;
    contain: layout style paint;
}

.spotui-ascii-row {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    contain: layout style paint;
}

.spotui-ascii-char {
    display: inline-block;
    font-size: clamp(9px, 1.4vw, 22px);
    line-height: 1;
    width: 1ch;
    text-align: left;
    position: relative;
    text-shadow: 0 0 6px currentColor;
}

@media (max-width: 700px) {
    .spotui-ascii-grid {
        font-size: clamp(5px, 1.1vw, 11px);
    }

    .spotui-ascii-char {
        font-size: clamp(5px, 1.1vw, 11px);
    }
}

@media (max-width: 450px) {
    .spotui-ascii-grid {
        font-size: clamp(3.5px, 1.4vw, 7px);
    }

    .spotui-ascii-char {
        font-size: clamp(3.5px, 1.4vw, 7px);
    }
}

#spotui-output {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column-reverse;
    white-space: pre-wrap;
    line-height: 1.6;
    user-select: text;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

body.spotui-command-mode #spotui-output {
    display: none !important;
}

body.spotui-cli-mode #spotui-output {
    display: flex !important;
}

#spotui-output::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#spotui-status {
    min-height: 20px;
    padding: 2px 0;
    color: var(--spotui-muted);
    font-size: 13px;
    white-space: pre-wrap;
    position: relative;
    z-index: 1;
    opacity: 0;
    transition: opacity 200ms ease;
}

#spotui-status.visible {
    opacity: 1;
}

#spotui-status.error {
    color: var(--spotui-error);
}

#spotui-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    margin-top: auto;
    border-top: 1px solid rgba(var(--spotui-accent-rgb), 0.18);
    position: relative;
    z-index: 1;
    transition: opacity 260ms ease, transform 260ms ease;
}

#spotui-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--spotui-accent);
    font-family: inherit;
    font-size: inherit;
    flex: 1 1 auto;
    min-width: 0;
}

.prompt { color: var(--spotui-accent); }
.cl-line { margin-bottom: 8px; user-select: text; }

#spotui-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-left: auto;
}

.spotui-control-btn {
    background: var(--spotui-accent);
    color: var(--spotui-contrast);
    border: none;
    padding: 6px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
}

.spotui-control-btn:hover {
    background: var(--spotui-accent-hover);
}

body.spotui-tui-hidden #spotui-tui {
    display: none !important;
}

body.spotui-tui-hidden #spotui-popup {
    display: none !important;
}

#spotui-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(480px, calc(100vw - 32px));
    max-height: 60vh;
    background: var(--spotui-bg);
    border: 2px solid var(--spotui-accent);
    border-radius: 6px;
    color: var(--spotui-text);
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 14px;
    z-index: 10002;
    padding: 16px;
    overflow-y: auto;
    outline: none;
    box-shadow: 0 0 24px rgba(0,0,0,0.6);
    scrollbar-width: none;
    -ms-overflow-style: none;
}
#spotui-popup::-webkit-scrollbar {
    width: 0;
    height: 0;
}
.popup-title {
    color: var(--spotui-accent);
    margin-bottom: 10px;
    font-size: 12px;
    border-bottom: 1px solid var(--spotui-divider);
    padding-bottom: 8px;
}
.popup-row {
    padding: 4px 6px;
}
.popup-row.selected {
    background: var(--spotui-accent);
    color: var(--spotui-contrast);
}
.popup-row.selected .popup-row-desc {
    color: var(--spotui-contrast);
    opacity: 0.75;
}
.popup-row-cmd {
    display: inline-block;
    min-width: 16ch;
    color: var(--spotui-accent);
}
.popup-row.selected .popup-row-cmd {
    color: var(--spotui-contrast);
}
.popup-row-desc {
    color: var(--spotui-muted);
}
.popup-input {
    width: 100%;
    background: var(--spotui-surface);
    border: 1px solid var(--spotui-accent);
    color: var(--spotui-accent);
    font-family: inherit;
    font-size: inherit;
    padding: 6px;
    outline: none;
    box-sizing: border-box;
}
`;

const SPOTUI_ASCII_ART = [
    "   ▄████████    ▄███████▄  ▄██████▄      ███     ███    █▄   ▄█  ",
    "  ███    ███   ███    ███ ███    ███ ▀█████████▄ ███    ███ ███  ",
    "  ███    █▀    ███    ███ ███    ███    ▀███▀▀██ ███    ███ ███▌ ",
    "  ███          ███    ███ ███    ███     ███   ▀ ███    ███ ███▌ ",
    "▀███████████ ▀█████████▀  ███    ███     ███     ███    ███ ███▌ ",
    "         ███   ███        ███    ███     ███     ███    ███ ███  ",
    "   ▄█    ███   ███        ███    ███     ███     ███    ███ ███  ",
    " ▄████████▀   ▄████▀       ▀██████▀     ▄████▀   ████████▀  █▀   ",
];

const GLITCH_CHARS = "01";
const DEFAULT_ACCENT = { r: 255, g: 140, b: 66 };

// Mirrors the sections of color.ini so the "theme" command can switch without a Spicetify
// restart. Adding a scheme means editing both files.
const SPOTUI_SCHEMES = [
    { id: "spotui", label: "SpoTUI - SkenS", accent: "#ff8c42", bg: "#0a0a0a", surface: "#111111", text: "#e6e6e6", muted: "#b3b3b3", divider: "#2a2a2a", error: "#ff5555" },
    { id: "matrix", label: "Matrix", accent: "#3bff6a", bg: "#050805", surface: "#0d150d", text: "#d8f5d8", muted: "#7aa87a", divider: "#1d2b1d", error: "#ff5555" },
    { id: "dracula", label: "Dracula", accent: "#bd93f9", bg: "#191a21", surface: "#21222c", text: "#f8f8f2", muted: "#a4a1c4", divider: "#343746", error: "#ff5555" },
    { id: "gruvbox", label: "Gruvbox", accent: "#fabd2f", bg: "#1d2021", surface: "#282828", text: "#ebdbb2", muted: "#a89984", divider: "#3c3836", error: "#fb4934" },
    { id: "nord", label: "Nord", accent: "#88c0d0", bg: "#2e3440", surface: "#343c4c", text: "#eceff4", muted: "#9aa5b8", divider: "#434c5e", error: "#bf616a" },
    { id: "mono", label: "Mono", accent: "#f0f0f0", bg: "#000000", surface: "#0f0f0f", text: "#f0f0f0", muted: "#909090", divider: "#2a2a2a", error: "#ff5555" },
];

const SCHEME_STORAGE_KEY = "spotui:scheme";
const SCHEME_SURFACE_TOKENS = ["bg", "surface", "text", "muted", "divider", "error"];

const BACKDROP_STORAGE_KEY = "spotui:backdrop";
const BACKDROP_OPACITY_STORAGE_KEY = "spotui:backdrop-opacity";

let backdropUrl = "";
let backdropOpacity = 0.35;

let accentHsl = rgbToHsl(DEFAULT_ACCENT);
let activeSchemeId = null;

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function parseColor(value) {
    if (!value) return null;
    const text = String(value).trim();

    const hex = text.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        const digits = hex[1].length === 3
            ? hex[1].split("").map((char) => char + char).join("")
            : hex[1];
        return {
            r: parseInt(digits.slice(0, 2), 16),
            g: parseInt(digits.slice(2, 4), 16),
            b: parseInt(digits.slice(4, 6), 16),
        };
    }

    const channels = text.match(/^(?:rgba?\()?\s*(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})/i);
    if (channels) {
        return {
            r: clampNumber(Number(channels[1]), 0, 255),
            g: clampNumber(Number(channels[2]), 0, 255),
            b: clampNumber(Number(channels[3]), 0, 255),
        };
    }

    return null;
}

function rgbToHsl({ r, g, b }) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
        if (max === rn) hue = ((gn - bn) / delta) % 6;
        else if (max === gn) hue = (bn - rn) / delta + 2;
        else hue = (rn - gn) / delta + 4;
    }
    hue = (hue * 60 + 360) % 360;

    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    return { h: hue, s: saturation * 100, l: lightness * 100 };
}

function contrastColor({ r, g, b }) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000000" : "#ffffff";
}

// Spreads mimic the original orange ramp: hue drifts +15deg and lightness spans 30 points.
function accentShade(mix) {
    const clamped = clampNumber(mix, 0, 1);
    const hue = (accentHsl.h + clamped * 15) % 360;
    const light = clampNumber(accentHsl.l + (clamped - 0.5) * 30, 12, 92);
    return `hsl(${hue.toFixed(1)}, ${accentHsl.s.toFixed(1)}%, ${light.toFixed(1)}%)`;
}

function accentGlitchColor() {
    const hue = (accentHsl.h - 5 + Math.random() * 30 + 360) % 360;
    const sat = Math.min(accentHsl.s + 10, 100);
    const light = clampNumber(accentHsl.l - 10 + Math.random() * 30, 20, 90);
    return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
}

function readCssVar(name) {
    try {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    } catch {
        return "";
    }
}

function findScheme(query) {
    if (!query) return null;
    const needle = String(query).trim().toLowerCase();
    return (
        SPOTUI_SCHEMES.find((scheme) => scheme.id === needle) ||
        SPOTUI_SCHEMES.find((scheme) => scheme.label.toLowerCase() === needle) ||
        SPOTUI_SCHEMES.find((scheme) => scheme.label.toLowerCase().startsWith(needle)) ||
        null
    );
}

function readStoredScheme() {
    try {
        return localStorage.getItem(SCHEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeScheme(schemeId) {
    try {
        if (schemeId) localStorage.setItem(SCHEME_STORAGE_KEY, schemeId);
        else localStorage.removeItem(SCHEME_STORAGE_KEY);
    } catch {
        // Storage can be unavailable; the scheme just will not survive a restart.
    }
}

// Passing null follows whatever scheme Spicetify applied through --spice-*.
function applyScheme(schemeId) {
    const scheme = findScheme(schemeId);
    activeSchemeId = scheme ? scheme.id : null;

    const resolved =
        (scheme && parseColor(scheme.accent)) ||
        parseColor(readCssVar("--spice-button-active")) ||
        parseColor(readCssVar("--spice-rgb-button-active")) ||
        parseColor(readCssVar("--spice-misc")) ||
        DEFAULT_ACCENT;

    accentHsl = rgbToHsl(resolved);

    const root = document.documentElement;
    root.style.setProperty("--spotui-accent", `rgb(${resolved.r}, ${resolved.g}, ${resolved.b})`);
    root.style.setProperty("--spotui-accent-rgb", `${resolved.r}, ${resolved.g}, ${resolved.b}`);
    root.style.setProperty("--spotui-accent-hover", accentShade(0.25));
    root.style.setProperty("--spotui-accent-light", accentShade(0.8));
    root.style.setProperty("--spotui-contrast", contrastColor(resolved));

    SCHEME_SURFACE_TOKENS.forEach((token) => {
        if (scheme) root.style.setProperty(`--spotui-${token}`, scheme[token]);
        else root.style.removeProperty(`--spotui-${token}`);
    });

    refreshAsciiColors();
}

function getCharColor(row, col, totalRows, totalCols) {
    const normRow = row / Math.max(totalRows - 1, 1);
    const normCol = col / Math.max(totalCols - 1, 1);
    return accentShade(normRow * 0.55 + normCol * 0.45);
}

let asciiAnimationInitialized = false;
let asciiCharData = [];
let asciiGridSize = { rows: 0, cols: 0 };

function refreshAsciiColors() {
    if (!asciiCharData.length) return;
    asciiCharData.forEach((entry) => {
        const color = getCharColor(entry.row, entry.col, asciiGridSize.rows, asciiGridSize.cols);
        entry.color = color;
        entry.el.style.color = color;
        entry.el.dataset.origColor = color;
    });
}

function initAsciiAnimation() {
    if (asciiAnimationInitialized) return;
    asciiAnimationInitialized = true;

    const logo = document.getElementById("spotui-logo");
    if (!logo) return;

    logo.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "spotui-ascii-grid";
    logo.appendChild(grid);

    const rows = SPOTUI_ASCII_ART.length;
    const cols = Math.max(...SPOTUI_ASCII_ART.map((row) => row.length));
    asciiGridSize = { rows, cols };
    const charData = [];
    const rowSpansCache = [];

    SPOTUI_ASCII_ART.forEach((line, rowIdx) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "spotui-ascii-row";
        rowDiv.dataset.row = rowIdx;
        const padded = line.padEnd(cols, " ");
        const chars = [...padded];
        const rowSpans = [];
        chars.forEach((ch, colIdx) => {
            const span = document.createElement("span");
            span.className = "spotui-ascii-char";
            span.textContent = ch;
            span.dataset.row = rowIdx;
            span.dataset.col = colIdx;
            span.dataset.original = ch;
            const color = getCharColor(rowIdx, colIdx, rows, cols);
            span.style.color = color;
            span.dataset.origColor = color;
            charData.push({
                row: rowIdx,
                col: colIdx,
                el: span,
                original: ch,
                color,
            });
            rowSpans.push(span);
            rowDiv.appendChild(span);
        });
        rowSpansCache.push(rowSpans);
        grid.appendChild(rowDiv);
    });

    asciiCharData = charData;

    function resetGrid() {
        charData.forEach(({ el, original, color }) => {
            el.textContent = original;
            el.style.color = color;
        });
    }

    function getRowSpans(rowIdx) {
        return rowSpansCache[rowIdx] || [];
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function decryptRow(rowIdx) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const chars = [...GLITCH_CHARS];
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || accentShade(0.5));

        spans.forEach((span) => {
            span.textContent = chars[Math.floor(Math.random() * chars.length)];
        });

        const indices = Array.from({ length: spans.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const batchSize = 4;
        for (let start = 0; start < indices.length; start += batchSize) {
            const batch = indices.slice(start, start + batchSize);
            batch.forEach((idx) => {
                spans[idx].textContent = chars[Math.floor(Math.random() * chars.length)];
            });
            await sleep(8);
            batch.forEach((idx) => {
                spans[idx].textContent = origs[idx];
                spans[idx].style.color = colors[idx];
            });
            await sleep(6);
        }
    }

    async function glitchRowWave(rowIdx, duration = 500) {
        const spans = getRowSpans(rowIdx);
        if (!spans.length) return;
        const origs = spans.map((span) => span.dataset.original || " ");
        const colors = spans.map((span) => span.dataset.origColor || accentShade(0.5));
        const chars = [...GLITCH_CHARS];
        const steps = 8;
        for (let step = 0; step < steps; step += 1) {
            spans.forEach((span) => {
                const randIdx = Math.floor(Math.random() * chars.length);
                span.textContent = chars[randIdx];
                span.style.color = accentGlitchColor();
            });
            await sleep(Math.floor(duration / steps));
        }
        spans.forEach((span, i) => {
            span.textContent = origs[i] || " ";
            span.style.color = colors[i] || accentShade(0.5);
        });
    }

    async function burstGlitch(duration = 800) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 8;
        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                const threshold = progress * 1.1;
                if (norm < threshold + 0.12 && norm > threshold - 0.12) {
                    if (Math.random() < 0.75) {
                        const randIdx = Math.floor(Math.random() * chars.length);
                        el.textContent = chars[randIdx];
                        el.style.color = accentGlitchColor();
                    }
                } else if (norm < threshold - 0.12) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function pulseGlitch(duration = 1200) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const waves = 3;
        const stepsPerWave = 10;

        for (let wave = 0; wave < waves; wave += 1) {
            for (let step = 0; step < stepsPerWave; step += 1) {
                const progress = step / stepsPerWave;
                const threshold = progress * 1.0;
                withDist.forEach(({ el, original, color, dist }) => {
                    const norm = dist / maxDist;
                    if (norm < threshold + 0.1 && norm > threshold - 0.1) {
                        if (Math.random() < 0.7) {
                            const randIdx = Math.floor(Math.random() * chars.length);
                            el.textContent = chars[randIdx];
                            el.style.color = accentGlitchColor();
                        }
                    } else if (norm < threshold - 0.1 && wave === waves - 1) {
                        el.textContent = original;
                        el.style.color = color;
                    }
                });
                await sleep(Math.floor(duration / (waves * stepsPerWave)));
            }
            await sleep(40);
        }
        resetGrid();
    }

    async function implosionGlitch(duration = 900) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 10;

        withDist.forEach(({ el }) => {
            const randIdx = Math.floor(Math.random() * chars.length);
            el.textContent = chars[randIdx];
            el.style.color = accentGlitchColor();
        });

        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            const threshold = 1.0 - progress * 1.1;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                if (norm <= threshold) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function spiralGlitch(duration = 1000) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withAngle = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            const angle = Math.atan2(dc, dr);
            const dist = Math.sqrt(dr * dr + dc * dc);
            return { ...entry, angle, dist };
        });
        const chars = [...GLITCH_CHARS];
        const steps = 36;
        const wedgeWidth = 0.5;

        for (let step = 0; step < steps; step += 1) {
            const sweepAngle = (step / steps) * Math.PI * 2 - Math.PI;
            withAngle.forEach(({ el, original, color, angle, dist }) => {
                let diff = Math.abs(angle - sweepAngle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;
                if (diff < wedgeWidth && dist > 0.1) {
                    const randIdx = Math.floor(Math.random() * chars.length);
                    el.textContent = chars[randIdx];
                    el.style.color = accentGlitchColor();
                } else {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function fuzzWaveGlitch(duration = 1000) {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        const withDist = charData.map((entry) => {
            const dr = entry.row - centerRow;
            const dc = entry.col - centerCol;
            return { ...entry, dist: Math.sqrt(dr * dr + dc * dc) };
        });
        const maxDist = Math.max(...withDist.map((entry) => entry.dist), 1);
        const chars = [...GLITCH_CHARS];
        const steps = 20;
        const bandWidth = 0.25;

        for (let step = 0; step < steps; step += 1) {
            const progress = step / steps;
            const targetNorm = progress * 1.0;
            withDist.forEach(({ el, original, color, dist }) => {
                const norm = dist / maxDist;
                const distanceFromTarget = Math.abs(norm - targetNorm);
                if (distanceFromTarget < bandWidth && Math.random() < 0.65) {
                    const randIdx = Math.floor(Math.random() * chars.length);
                    el.textContent = chars[randIdx];
                    el.style.color = accentGlitchColor();
                } else if (distanceFromTarget > bandWidth * 1.5) {
                    el.textContent = original;
                    el.style.color = color;
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function staticGlitch(duration = 600) {
        const chars = [...GLITCH_CHARS];
        const steps = 6;
        for (let step = 0; step < steps; step += 1) {
            charData.forEach(({ el }) => {
                if (Math.random() < 0.8) {
                    el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    el.style.color = accentGlitchColor();
                }
            });
            await sleep(Math.floor(duration / steps));
        }
        resetGrid();
    }

    async function horizontalBand(direction = 1, duration = 800) {
        const chars = [...GLITCH_CHARS];
        const start = direction === 1 ? 0 : rows - 1;
        const totalSteps = rows + 2;
        for (let step = 0; step <= totalSteps; step += 1) {
            resetGrid();
            const bandCenter = start + direction * step;
            const bandTop = Math.max(0, bandCenter - 1);
            const bandBottom = Math.min(rows - 1, bandCenter + 1);
            for (let row = bandTop; row <= bandBottom; row += 1) {
                const spans = getRowSpans(row);
                spans.forEach((span) => {
                    span.textContent = chars[Math.floor(Math.random() * chars.length)];
                    span.style.color = accentGlitchColor();
                });
            }
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    async function verticalSlice(direction = 1, duration = 800) {
        const chars = [...GLITCH_CHARS];
        const start = direction === 1 ? 0 : cols - 1;
        const totalSteps = cols + 2;
        for (let step = 0; step <= totalSteps; step += 1) {
            resetGrid();
            const bandCenter = start + direction * step;
            const bandLeft = Math.max(0, bandCenter - 1);
            const bandRight = Math.min(cols - 1, bandCenter + 1);
            charData.forEach(({ el, col }) => {
                if (col >= bandLeft && col <= bandRight) {
                    el.textContent = chars[Math.floor(Math.random() * chars.length)];
                    el.style.color = accentGlitchColor();
                }
            });
            await sleep(Math.floor(duration / totalSteps));
        }
        resetGrid();
    }

    async function stageWaveDown() {
        for (let row = 0; row < rows; row += 1) {
            await glitchRowWave(row, 300);
            await sleep(20);
        }
    }

    async function stageWaveUp() {
        for (let row = rows - 1; row >= 0; row -= 1) {
            await glitchRowWave(row, 260);
            await sleep(15);
        }
    }

    async function stageDecrypt() {
        const chars = [...GLITCH_CHARS];
        charData.forEach(({ el }) => {
            const randIdx = Math.floor(Math.random() * chars.length);
            el.textContent = chars[randIdx];
        });
        for (let row = 0; row < rows; row += 1) {
            await decryptRow(row);
        }
    }

    async function stageBurst() {
        await burstGlitch(900);
    }

    async function stagePulse() {
        await pulseGlitch(1200);
    }

    async function stageImplosion() {
        await implosionGlitch(900);
    }

    async function stageSpiral() {
        await spiralGlitch(1000);
    }

    async function stageFuzzWave() {
        await fuzzWaveGlitch(1000);
    }

    async function stageStatic() {
        await staticGlitch(700);
    }

    async function stageHSlashDown() {
        await horizontalBand(1, 800);
    }

    async function stageHSlashUp() {
        await horizontalBand(-1, 800);
    }

    async function stageVSlashRight() {
        await verticalSlice(1, 800);
    }

    async function stageVSlashLeft() {
        await verticalSlice(-1, 800);
    }

    const stageFunctions = [
        stageWaveDown,
        stageWaveUp,
        stageDecrypt,
        stageBurst,
        stagePulse,
        stageImplosion,
        stageSpiral,
        stageFuzzWave,
        stageStatic,
        stageHSlashDown,
        stageHSlashUp,
        stageVSlashRight,
        stageVSlashLeft,
    ];

    function shuffleArray(array) {
        for (let index = array.length - 1; index > 0; index -= 1) {
            const j = Math.floor(Math.random() * (index + 1));
            [array[index], array[j]] = [array[j], array[index]];
        }
        return array;
    }

    async function runLoop() {
        while (true) {
            const shuffled = shuffleArray([...stageFunctions]);
            for (const stageFn of shuffled) {
                await stageFn();
                await sleep(700 + Math.random() * 400);
            }
            resetGrid();
            await sleep(300);
        }
    }

    runLoop().catch(console.error);
}

const STATUS_TIMEOUT_MS = 5000;
const LYRICS_REFRESH_DEBOUNCE_MS = 150;
const PLAYLIST_PAGE_SIZE = 200;
const PLAYLIST_MAX_TRACKS = 10000;
const SEARCH_RESULT_LIMIT = 25;

let tuiMode = "command";

let commandHistory = [];
let historyIndex = -1;
let historyDraft = "";
let lyricsObserver = null;

function injectStyle() {
    const s = document.createElement("style");
    s.textContent = style;
    document.head.appendChild(s);
}

function setTuiMode(mode) {
    tuiMode = mode === "cli" ? "cli" : "command";
    document.body.classList.toggle("spotui-cli-mode", tuiMode === "cli");
    document.body.classList.toggle("spotui-command-mode", tuiMode !== "cli");
}

function createCopyButton() {
    const controls = document.createElement("div");
    controls.id = "spotui-controls";

    const copyBtn = document.createElement("button");
    copyBtn.id = "copy-log-btn";
    copyBtn.className = "spotui-control-btn";
    copyBtn.textContent = "Copy log";
    copyBtn.addEventListener("click", () => {
        const output = document.getElementById("spotui-output");
        if (output) {
            const text = output.innerText;
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => { copyBtn.textContent = "Copy log"; }, 1500);
            }).catch(() => {
                alert("Copy failed. Please manually select and copy.");
            });
        }
    });

    const hideBtn = document.createElement("button");
    hideBtn.id = "hide-tui-btn";
    hideBtn.className = "spotui-control-btn";
    hideBtn.textContent = "Hide TUI";
    hideBtn.addEventListener("click", () => {
        const hidden = document.body.classList.toggle("spotui-tui-hidden");
        hideBtn.textContent = hidden ? "Show TUI" : "Hide TUI";
    });

    const spotifyBtn = document.createElement("button");
    spotifyBtn.id = "enable-spotify-btn";
    spotifyBtn.className = "spotui-control-btn";
    spotifyBtn.textContent = "Enable Spotify";
    spotifyBtn.addEventListener("click", () => {
        const enabled = document.body.classList.toggle("spotui-spotify-enabled");
        if (enabled) {
            document.body.classList.add("spotui-tui-hidden");
            hideBtn.textContent = "Show TUI";
            spotifyBtn.textContent = "Disable Spotify";
        } else {
            spotifyBtn.textContent = "Enable Spotify";
            document.body.classList.remove("spotui-tui-hidden");
            document.body.classList.remove("spotui-search-mode");
            hideBtn.textContent = "Hide TUI";
        }
    });

    controls.appendChild(copyBtn);
    controls.appendChild(hideBtn);
    controls.appendChild(spotifyBtn);
    const footer = document.getElementById("spotui-footer");
    (footer || document.body).appendChild(controls);

    const backBtn = document.createElement("button");
    backBtn.id = "spotui-back-btn";
    backBtn.className = "spotui-control-btn";
    backBtn.textContent = "Back";
    backBtn.addEventListener("click", () => {
        document.body.classList.remove("spotui-search-mode");
        document.body.classList.remove("spotui-spotify-enabled");
        document.body.classList.remove("spotui-tui-hidden");
        spotifyBtn.textContent = "Enable Spotify";
        hideBtn.textContent = "Hide TUI";
        syncLyricsState();
    });
    document.body.appendChild(backBtn);
}

function detectLyricsSurface() {
    return Boolean(
        document.querySelector(
            ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer"
        )
    );
}

function syncLyricsState() {
    if (!document.body) return;
    document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
}

function hookLyricsButton() {
    const button = document.querySelector(".main-nowPlayingBar-lyricsButton");
    if (!button || button.dataset.spotuiTuiLyricsHooked === "1") return;
    button.dataset.spotuiTuiLyricsHooked = "1";
    button.addEventListener(
        "click",
        () => {
            setTimeout(syncLyricsState, 50);
            setTimeout(syncLyricsState, 250);
            setTimeout(syncLyricsState, 1000);
        },
        true
    );
}

function initLyricsBridge() {
    if (!document.body) {
        setTimeout(initLyricsBridge, 250);
        return;
    }

    const refresh = () => {
        hookLyricsButton();
        syncLyricsState();
    };

    // The observer watches the whole body, so Spotify's constant DOM churn would otherwise
    // run this on every mutation.
    let refreshTimer = null;
    const scheduleRefresh = () => {
        if (refreshTimer !== null) return;
        refreshTimer = setTimeout(() => {
            refreshTimer = null;
            refresh();
        }, LYRICS_REFRESH_DEBOUNCE_MS);
    };

    refresh();

    if (!lyricsObserver) {
        lyricsObserver = new MutationObserver(scheduleRefresh);
        lyricsObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
        });
        window.addEventListener(
            "beforeunload",
            () => {
                clearTimeout(refreshTimer);
                lyricsObserver?.disconnect();
            },
            { once: true }
        );
    }
}

function createTerminal() {
    const box = document.createElement("div");
    box.id = "spotui-tui";
    setTuiMode("command");
    box.innerHTML = `
<div id="spotui-backdrop"></div>
<div id="spotui-logo"></div>
<div id="spotui-output">SpoTUI v1.1

Type /help

</div>
<div id="spotui-status"></div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help for a list of commands">
</div>
`;
    document.body.appendChild(box);
    initAsciiAnimation();
    renderBackdrop();

    const input = document.getElementById("spotui-input");
    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const cmd = input.value.trim();
            input.value = "";
            if (!cmd) return;
            pushHistory(cmd);
            print("> " + cmd, "echo");
            await execute(cmd);
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            recallHistory(input, -1);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            recallHistory(input, 1);
        }
    });

}

function pushHistory(cmd) {
    if (commandHistory[commandHistory.length - 1] !== cmd) {
        commandHistory.push(cmd);
    }
    if (commandHistory.length > 100) commandHistory.shift();
    historyIndex = -1;
    historyDraft = "";
}

function recallHistory(input, direction) {
    if (!commandHistory.length) return;

    if (historyIndex === -1) {
        if (direction > 0) return;
        historyDraft = input.value;
        historyIndex = commandHistory.length - 1;
    } else {
        const next = historyIndex + direction;
        if (next >= commandHistory.length) {
            historyIndex = -1;
            input.value = historyDraft;
            input.setSelectionRange(input.value.length, input.value.length);
            return;
        }
        historyIndex = Math.max(next, 0);
    }

    input.value = commandHistory[historyIndex];
    input.setSelectionRange(input.value.length, input.value.length);
}

let statusTimer = null;

function setStatus(text, level) {
    const status = document.getElementById("spotui-status");
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("error", level === "error");
    status.classList.add("visible");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
        status.classList.remove("visible");
    }, STATUS_TIMEOUT_MS);
}

// Levels: "info" and "error" reach the status line so feedback survives command mode,
// where the log is hidden; "log" and "echo" stay in the scrollback only.
function print(text, level = "info") {
    if (level === "info" || level === "error") {
        setStatus(text, level);
    }

    if (tuiMode !== "cli") return;
    const output = document.getElementById("spotui-output");
    if (!output) return;
    const line = document.createElement("div");
    line.className = "cl-line";
    line.textContent = text;
    output.prepend(line);
    output.scrollTop = 0;
}

async function execute(cmd) {
    const rawCmd = cmd.trim();
    const cleanedCmd = rawCmd.startsWith("/") || rawCmd.startsWith(".") ? rawCmd.slice(1).trim() : rawCmd;
    const [command, ...args] = cleanedCmd.split(/\s+/);
    const argText = args.join(" ").trim();

    if (command === "tui") {
        if (args[0] === "-m") {
            const mode = args[1];
            if (!mode || (mode !== "cli" && mode !== "command")) {
                print("Usage: tui -m [command|cli]", "error");
                return;
            }
            setTuiMode(mode);
            print(`TUI mode: ${mode}`);
            return;
        }
        print("Usage: tui -m [command|cli]", "error");
        return;
    }

    if (command === "help") {
        openHelpPopup(argText);
        return;
    }
    if (command === "clear") {
        document.getElementById("spotui-output").textContent = "";
        return;
    }

    if (command === "playlist") {
        await openPlaylistPopup();
        return;
    }

    if (command === "list") {
        await openPlaylistTracksPopup();
        return;
    }

    if (command === "queue") {
        await openQueuePopup();
        return;
    }

    if (command === "play") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            if (!wasPlaying) {
                Spicetify.Player.togglePlay();
            }
            print("Playing");
        } catch (err) {
            print("Play error: " + err.message, "error");
        }
        return;
    }

    if (command === "pause") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            if (wasPlaying) {
                Spicetify.Player.togglePlay();
            }
            print("Paused");
        } catch (err) {
            print("Pause error: " + err.message, "error");
        }
        return;
    }

    if (command === "p") {
        try {
            const wasPlaying = Spicetify.Player.isPlaying();
            Spicetify.Player.togglePlay();
            print(wasPlaying ? "Paused" : "Playing");
        } catch (err) {
            print("Play/pause error: " + err.message, "error");
        }
        return;
    }

    if (command === "search") {
        if (argText) {
            await openSearchPopup(argText);
            return;
        }
        document.body.classList.add("spotui-search-mode");
        document.body.classList.add("spotui-tui-hidden");
        syncLyricsState();
        return;
    }

    if (command === "add") {
        await handleAddCommand(argText);
        return;
    }

    if (command === "np" || command === "info") {
        handleNowPlayingCommand();
        return;
    }

    if (command === "like") {
        handleHeartCommand(true);
        return;
    }

    if (command === "unlike") {
        handleHeartCommand(false);
        return;
    }

    if (command === "seek") {
        handleSeekCommand(argText);
        return;
    }

    if (command === "lyrics") {
        handleLyricsCommand();
        return;
    }

    if (command === "sleep") {
        handleSleepCommand(argText);
        return;
    }

    if (command === "theme") {
        handleThemeCommand(argText);
        return;
    }

    if (command === "bg") {
        handleBackdropCommand(argText);
        return;
    }

    if (command === "skip") {
        try {
            Spicetify.Player.next();
            print("Skipped to next track");
        } catch (err) {
            print("Skip error: " + err.message, "error");
        }
        return;
    }
    if (command === "back") {
        try {
            Spicetify.Player.back();
            print("Went back to previous track");
        } catch (err) {
            print("Back error: " + err.message, "error");
        }
        return;
    }

    if (command === "volume" || command === "v") {
        try {
            if (!argText) {
                print("Usage: volume <0-100>", "error");
                return;
            }
            const percent = Number(argText);
            if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
                print("Volume must be between 0 and 100.", "error");
                return;
            }
            Spicetify.Player.setVolume(percent / 100);
            print(`Volume is ${Math.round(percent)}%`);
        } catch (err) {
            print("Volume error: " + err.message, "error");
        }
        return;
    }

    if (command === "shuffle") {
        try {
            const current = Spicetify.Player.getShuffle();
            Spicetify.Player.setShuffle(!current);
            print("Shuffle: " + (!current ? "ON" : "OFF"));
        } catch (err) {
            print("Shuffle error: " + err.message, "error");
        }
        return;
    }

    if (command === "loop") {
        handleRepeatCommand("loop", argText);
        return;
    }

    if (command === "superloop") {
        handleRepeatCommand("superloop", argText);
        return;
    }

    print("Unknown command. Type /help", "error");
}

// Each entry is [usage, description, ...aliases used when resolving "help <command>"].
const HELP_CATEGORIES = [
    {
        id: "playback",
        label: "Playback",
        entries: [
            ["play", "resume playback"],
            ["pause", "pause playback"],
            ["p", "toggle play/pause"],
            ["skip", "next track"],
            ["back", "previous track"],
            ["seek <pos>", "mm:ss, seconds, 50%, +15 or -15"],
            ["v | volume <0-100>", "set volume", "v", "volume"],
            ["shuffle", "toggle shuffle"],
            ["loop [on|off]", "repeat the whole context"],
            ["superloop [on|off]", "repeat the current track"],
            ["sleep <min|off>", "pause playback after N minutes"],
        ],
    },
    {
        id: "library",
        label: "Library",
        entries: [
            ["search <terms>", "search tracks (no terms opens Spotify search)"],
            ["add <terms>", "queue the top search result"],
            ["playlist", "browse your playlists"],
            ["list", "tracks of the playing playlist"],
            ["queue", "current queue"],
            ["like | unlike", "save or remove the current track", "like", "unlike"],
            ["np | info", "show what is playing", "np", "info"],
            ["lyrics", "toggle the lyrics panel"],
        ],
    },
    {
        id: "interface",
        label: "Interface",
        entries: [
            ["theme [name|auto]", "switch color scheme live; no name opens the picker"],
            ["bg <url|off>", "image behind the logo screen; bg opacity <0-100>"],
            ["tui -m [command|cli]", "switch interface mode"],
            ["clear", "clear the log"],
            ["help [category|command]", "this list"],
        ],
    },
];

function helpEntryNames(entry) {
    const [usage, , ...aliases] = entry;
    return aliases.length ? aliases : [usage.split(/[\s<[|]/)[0]];
}

// Resolves "help <query>" to a category, falling back to the category owning a command.
function findHelpTarget(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return null;

    const byCategory = HELP_CATEGORIES.findIndex(
        (category) => category.id === needle || category.label.toLowerCase().startsWith(needle)
    );
    if (byCategory >= 0) return { category: byCategory, entry: 0 };

    for (let i = 0; i < HELP_CATEGORIES.length; i += 1) {
        const entry = HELP_CATEGORIES[i].entries.findIndex((item) =>
            helpEntryNames(item).includes(needle)
        );
        if (entry >= 0) return { category: i, entry };
    }

    return null;
}

let popup = null;
let popupMode = "list";
let playlists = [];
let popupSelected = 0;
let popupTracks = [];
let popupTrackSelected = 0;
let popupTrackTitle = "";
let popupTrackContext = null;
let popupSchemeSelected = 0;
let popupSchemeOriginal = null;
let popupHelpSelected = 0;
let popupHelpCategory = null;
let lastPlaylistContextUri = null;
let lastQueueSnapshot = null;

function openHelpPopup(query) {
    const target = query ? findHelpTarget(query) : null;

    if (query && !target) {
        const names = HELP_CATEGORIES.map((category) => category.id).join(", ");
        print(`No help for "${query}". Categories: ${names}`, "error");
        return;
    }

    popupHelpCategory = target ? target.category : null;
    popupHelpSelected = target ? target.entry : 0;
    popupMode = "help";
    renderPopup();
}

function openThemePopup() {
    popupSchemeOriginal = activeSchemeId;
    const current = SPOTUI_SCHEMES.findIndex((scheme) => scheme.id === activeSchemeId);
    popupSchemeSelected = Math.max(current, 0);
    popupMode = "themes";
    renderPopup();
}

function getTrackTitle(track, index = 0) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    return track?.name || track?.title || meta.title || meta.name || `Track ${index + 1}`;
}

function getTrackArtist(track) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    if (track?.artist) return track.artist;
    if (Array.isArray(track?.artists) && track.artists.length) {
        return track.artists.map((artist) => artist?.name).filter(Boolean).join(", ");
    }
    if (meta.artist_name) return meta.artist_name;
    if (meta["artist_name:1"]) return meta["artist_name:1"];
    return "";
}

function normalizeTrackItem(track, index = 0) {
    const uri = track?.uri || track?.contextTrack?.uri || "";
    return {
        uri,
        name: getTrackTitle(track, index),
        artist: getTrackArtist(track),
    };
}

function dedupeTracks(tracks) {
    const seen = new Set();
    const out = [];
    for (const track of tracks) {
        if (!track?.uri || seen.has(track.uri)) continue;
        seen.add(track.uri);
        out.push(track);
    }
    return out;
}

function findTrackIndexByUri(tracks, uri) {
    if (!uri) return -1;
    return tracks.findIndex((track) => track?.uri === uri);
}

function getCurrentPlaylistContextUri() {
    const current = Spicetify.Player.data?.context?.uri;
    if (current && Spicetify.URI.isPlaylistV1OrV2(current)) return current;
    return lastPlaylistContextUri;
}

async function searchTracks(query, limit = SEARCH_RESULT_LIMIT) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
    const res = await Spicetify.CosmosAsync.get(url);
    return dedupeTracks((res?.tracks?.items || []).map((track, index) => normalizeTrackItem(track, index)));
}

async function openSearchPopup(query) {
    print(`Searching "${query}"...`);
    try {
        const tracks = await searchTracks(query);
        if (!tracks.length) {
            print(`No results for "${query}".`, "error");
            return;
        }
        popupTracks = tracks;
        popupTrackTitle = `Search: ${query}`;
        popupTrackContext = null;
        popupTrackSelected = 0;
        popupMode = "tracks";
        renderPopup();
        print(`${tracks.length} result${tracks.length === 1 ? "" : "s"} for "${query}"`);
    } catch (err) {
        print("Search error: " + err.message, "error");
        console.error("SpoTUI search error:", err);
    }
}

async function queueTrack(uri) {
    const item = { uri };
    if (Spicetify.Platform?.PlayerAPI?.addToQueue) {
        await Spicetify.Platform.PlayerAPI.addToQueue([item]);
        return;
    }
    await Spicetify.addToQueue([item]);
}

async function handleAddCommand(query) {
    if (!query) {
        print("Usage: add <search terms>", "error");
        return;
    }
    try {
        const [track] = await searchTracks(query, 1);
        if (!track) {
            print(`No results for "${query}".`, "error");
            return;
        }
        await queueTrack(track.uri);
        print(`Queued: ${formatTrackLabel(track)}`);
    } catch (err) {
        print("Add error: " + err.message, "error");
        console.error("SpoTUI add error:", err);
    }
}

function formatTrackLabel(track) {
    return track.artist ? `${track.name} - ${track.artist}` : track.name;
}

function renderProgressBar(percent, width = 24) {
    const filled = Math.round(clampNumber(percent, 0, 1) * width);
    return `[${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}]`;
}

function handleNowPlayingCommand() {
    const item = Spicetify.Player.data?.item;
    if (!item) {
        print("Nothing is playing.", "error");
        return;
    }

    const track = normalizeTrackItem(item);
    const progress = Spicetify.Player.getProgress();
    const duration = Spicetify.Player.getDuration();
    const clock = `${Spicetify.Player.formatTime(progress)} / ${Spicetify.Player.formatTime(duration)}`;
    const album = item.album?.name || item.metadata?.album_title || "";
    const repeatLabels = ["off", "all", "one"];

    print(formatTrackLabel(track), "log");
    if (album) print(`Album: ${album}`, "log");
    print(`${renderProgressBar(duration ? progress / duration : 0)} ${clock}`, "log");
    print(
        `volume ${Math.round(Spicetify.Player.getVolume() * 100)}%` +
            ` | shuffle ${Spicetify.Player.getShuffle() ? "on" : "off"}` +
            ` | repeat ${repeatLabels[Spicetify.Player.getRepeat()] ?? "off"}` +
            ` | ${Spicetify.Player.getHeart() ? "liked" : "not liked"}`,
        "log"
    );
    setStatus(`${formatTrackLabel(track)}  ${clock}`);
}

function handleHeartCommand(shouldLike) {
    try {
        if (!Spicetify.Player.data?.item) {
            print("Nothing is playing.", "error");
            return;
        }
        if (Spicetify.Player.getHeart() === shouldLike) {
            print(shouldLike ? "Already liked." : "Not in your library.");
            return;
        }
        Spicetify.Player.setHeart(shouldLike);
        print(shouldLike ? "Liked current track" : "Removed from library");
    } catch (err) {
        print("Like error: " + err.message, "error");
    }
}

// Accepts mm:ss, plain seconds, a percentage, or a +/- relative offset in seconds.
function parseSeekTarget(arg, progress, duration) {
    const relative = arg.match(/^([+-])(\d+(?:\.\d+)?)$/);
    if (relative) {
        const delta = Number(relative[2]) * 1000 * (relative[1] === "-" ? -1 : 1);
        return progress + delta;
    }

    const percent = arg.match(/^(\d+(?:\.\d+)?)%$/);
    if (percent) {
        return (Number(percent[1]) / 100) * duration;
    }

    const clock = arg.match(/^(\d+):([0-5]?\d)$/);
    if (clock) {
        return (Number(clock[1]) * 60 + Number(clock[2])) * 1000;
    }

    const seconds = arg.match(/^\d+(?:\.\d+)?$/);
    if (seconds) {
        return Number(arg) * 1000;
    }

    return null;
}

function handleSeekCommand(arg) {
    try {
        const duration = Spicetify.Player.getDuration();
        if (!duration) {
            print("Nothing is playing.", "error");
            return;
        }
        if (!arg) {
            print("Usage: seek <mm:ss | seconds | 50% | +15 | -15>", "error");
            return;
        }

        const target = parseSeekTarget(arg, Spicetify.Player.getProgress(), duration);
        if (target === null) {
            print("Usage: seek <mm:ss | seconds | 50% | +15 | -15>", "error");
            return;
        }

        const position = clampNumber(Math.round(target), 0, duration);
        Spicetify.Player.seek(position);
        print(`Seeked to ${Spicetify.Player.formatTime(position)}`);
    } catch (err) {
        print("Seek error: " + err.message, "error");
    }
}

function handleLyricsCommand() {
    const button = document.querySelector(".main-nowPlayingBar-lyricsButton");
    if (!button) {
        print("Lyrics button not available for this track.", "error");
        return;
    }
    button.click();
    setTimeout(syncLyricsState, 250);
    print(detectLyricsSurface() ? "Closing lyrics" : "Opening lyrics");
}

let sleepTimer = null;

function handleSleepCommand(arg) {
    if (arg === "off" || arg === "cancel") {
        if (sleepTimer === null) {
            print("No sleep timer set.");
            return;
        }
        clearTimeout(sleepTimer);
        sleepTimer = null;
        print("Sleep timer cancelled");
        return;
    }

    const minutes = Number(arg);
    if (!arg || !Number.isFinite(minutes) || minutes <= 0 || minutes > 600) {
        print("Usage: sleep <minutes 1-600 | off>", "error");
        return;
    }

    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
        sleepTimer = null;
        try {
            if (Spicetify.Player.isPlaying()) Spicetify.Player.togglePlay();
            print("Sleep timer reached, playback paused");
        } catch (err) {
            print("Sleep timer error: " + err.message, "error");
        }
    }, minutes * 60 * 1000);

    print(`Sleep timer set for ${minutes} minute${minutes === 1 ? "" : "s"}`);
}

function parseImageUrl(input) {
    try {
        const url = new URL(String(input).trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.href;
    } catch {
        return null;
    }
}

function renderBackdrop() {
    document.documentElement.style.setProperty("--spotui-backdrop-opacity", String(backdropOpacity));

    const el = document.getElementById("spotui-backdrop");
    if (!el) return;

    if (backdropUrl) {
        // The URL lands inside a CSS url(), so quotes and backslashes must not survive.
        el.style.backgroundImage = `url("${backdropUrl.replace(/["\\]/g, encodeURIComponent)}")`;
        el.classList.add("visible");
    } else {
        el.style.backgroundImage = "";
        el.classList.remove("visible");
    }
}

function setBackdrop(url, opacity) {
    backdropUrl = url;
    backdropOpacity = clampNumber(opacity, 0, 1);

    try {
        if (url) localStorage.setItem(BACKDROP_STORAGE_KEY, url);
        else localStorage.removeItem(BACKDROP_STORAGE_KEY);
        localStorage.setItem(BACKDROP_OPACITY_STORAGE_KEY, String(backdropOpacity));
    } catch {
        // Storage can be unavailable; the backdrop just will not survive a restart.
    }

    renderBackdrop();
}

function restoreBackdrop() {
    try {
        backdropUrl = parseImageUrl(localStorage.getItem(BACKDROP_STORAGE_KEY) || "") || "";
        const stored = Number(localStorage.getItem(BACKDROP_OPACITY_STORAGE_KEY));
        if (Number.isFinite(stored) && stored > 0) backdropOpacity = clampNumber(stored, 0, 1);
    } catch {
        backdropUrl = "";
    }
}

const BACKDROP_USAGE = "Usage: bg <http(s) image url> | bg opacity <0-100> | bg off";

function handleBackdropCommand(arg) {
    const trimmed = arg.trim();
    const [sub, ...rest] = trimmed.split(/\s+/);
    const value = rest.join(" ").trim();

    if (!sub) {
        print(
            backdropUrl
                ? `Backdrop at ${Math.round(backdropOpacity * 100)}%: ${backdropUrl}`
                : `No backdrop set. ${BACKDROP_USAGE}`
        );
        return;
    }

    if (sub === "off" || sub === "clear" || sub === "none") {
        setBackdrop("", backdropOpacity);
        print("Backdrop removed");
        return;
    }

    if (sub === "opacity" || sub === "o") {
        const percent = Number(value);
        if (!value || !Number.isFinite(percent) || percent < 0 || percent > 100) {
            print("Usage: bg opacity <0-100>", "error");
            return;
        }
        setBackdrop(backdropUrl, percent / 100);
        print(`Backdrop opacity: ${Math.round(percent)}%`);
        return;
    }

    const url = parseImageUrl(trimmed);
    if (!url) {
        print(BACKDROP_USAGE, "error");
        return;
    }

    print("Loading backdrop...");
    const probe = new Image();
    probe.onload = () => {
        setBackdrop(url, backdropOpacity);
        print(`Backdrop set at ${Math.round(backdropOpacity * 100)}%`);
    };
    probe.onerror = () => print("Could not load that image URL.", "error");
    probe.src = url;
}

function handleThemeCommand(arg) {
    const query = arg.trim();

    if (!query) {
        openThemePopup();
        return;
    }

    if (query === "auto" || query === "reset") {
        applyScheme(null);
        storeScheme(null);
        print("Theme: following the Spicetify scheme");
        return;
    }

    const scheme = findScheme(query);
    if (!scheme) {
        const names = SPOTUI_SCHEMES.map((entry) => entry.id).join(", ");
        print(`Unknown theme "${query}". Try: ${names}, auto`, "error");
        return;
    }

    applyScheme(scheme.id);
    storeScheme(scheme.id);
    print(`Theme: ${scheme.label}`);
}

function handleRepeatCommand(kind, arg) {
    try {
        const current = Spicetify.Player.getRepeat();
        const targetMode = kind === "loop" ? 1 : 2;
        let nextMode = targetMode;

        if (arg === "on") {
            nextMode = targetMode;
        } else if (arg === "off") {
            nextMode = 0;
        } else if (arg === "") {
            nextMode = current === targetMode ? 0 : targetMode;
        } else {
            print(`Usage: /${kind} [on|off]`, "error");
            return;
        }

        Spicetify.Player.setRepeat(nextMode);
        print(`${kind === "loop" ? "Loop" : "Superloop"}: ${nextMode === 0 ? "OFF" : "ON"}`);
    } catch (err) {
        print(`${kind === "loop" ? "Loop" : "Superloop"} error: ${err.message}`, "error");
    }
}

async function getPlaylists() {
    const rootlist = await Spicetify.Platform.RootlistAPI.getContents();
    const list = [];
    function flatten(items) {
        for (const item of items) {
            if (item.type === "playlist") {
                list.push({ name: item.name, uri: item.uri });
            } else if (item.type === "folder" && item.items) {
                flatten(item.items);
            }
        }
    }
    flatten(rootlist.items);
    return list;
}

async function openPlaylistPopup() {
    try {
        playlists = await getPlaylists();
    } catch (err) {
        print("Playlist error: " + err.message, "error");
        return;
    }
    popupSelected = 0;
    popupMode = "list";
    renderPopup();
}

async function fetchPlaylistItems(contextUri) {
    const items = [];
    let offset = 0;

    while (offset < PLAYLIST_MAX_TRACKS) {
        const res = await Spicetify.Platform.PlaylistAPI.getContents(contextUri, {
            limit: PLAYLIST_PAGE_SIZE,
            offset,
        });
        const page = res?.items || [];
        items.push(...page);

        const total = res?.totalLength ?? res?.unfilteredTotalLength;
        offset += page.length;
        if (page.length < PLAYLIST_PAGE_SIZE) break;
        if (typeof total === "number" && offset >= total) break;
    }

    return items;
}

async function openPlaylistTracksPopup() {
    try {
        const contextUri = getCurrentPlaylistContextUri();
        if (!contextUri || !Spicetify.URI.isPlaylistV1OrV2(contextUri)) {
            print("List error: not currently playing a playlist.", "error");
            return;
        }
        const items = await fetchPlaylistItems(contextUri);
        popupTracks = items
            .filter((item) => item && item.uri && item.isPlayable !== false)
            .map((item, index) => normalizeTrackItem(item, index));
        popupTracks = dedupeTracks(popupTracks);
        popupTrackTitle = "Playlist tracks";
        popupTrackContext = Spicetify.Player.data?.context || { uri: contextUri };
        lastPlaylistContextUri = contextUri;
        const currentTrackUri = Spicetify.Player.data?.item?.uri;
        popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
        popupMode = "tracks";
        renderPopup();
    } catch (err) {
        print("List error: " + err.message, "error");
        console.error("Playlist tracks popup error:", err);
    }
}

function getQueueTracks() {
    const queue = Spicetify.Queue || {};
    const tracks = [];

    if (queue.track && queue.track.uri) {
        tracks.push(queue.track);
    } else if (Spicetify.Player.data?.item?.uri) {
        tracks.push(Spicetify.Player.data.item);
    }

    for (const item of queue.nextTracks || []) {
        const track = item?.contextTrack || item?.track || item;
        if (!track?.uri || track.uri === "spotify:delimiter") continue;
        tracks.push(track);
    }

    const currentTrackContextUri =
        Spicetify.Player.data?.context_uri ||
        Spicetify.Player.data?.context?.uri ||
        queue.track?.contextTrack?.metadata?.context_uri ||
        queue.track?.metadata?.context_uri ||
        null;

    popupTrackContext = currentTrackContextUri ? { uri: currentTrackContextUri } : Spicetify.Player.data?.context || null;

    return dedupeTracks(tracks.map((track, index) => normalizeTrackItem(track, index)));
}

function openQueuePopup() {
    const currentQueueTracks = getQueueTracks();
    if (!lastQueueSnapshot || lastQueueSnapshot.length === 0) {
        lastQueueSnapshot = currentQueueTracks;
    }
    popupTracks = lastQueueSnapshot.length ? lastQueueSnapshot : currentQueueTracks;
    popupTrackTitle = "Queue";
    const currentTrackUri = Spicetify.Player.data?.item?.uri;
    popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
    popupMode = "tracks";
    renderPopup();
}

function closePopup() {
    if (popup) {
        popup.remove();
        popup = null;
    }
    popupMode = "list";
    popupTracks = [];
    popupTrackSelected = 0;
    popupTrackTitle = "";
    popupTrackContext = null;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
}

function renderPopup() {
    if (popup) popup.remove();
    popup = document.createElement("div");
    popup.id = "spotui-popup";
    popup.tabIndex = 0;

    if (popupMode === "list") {
        popup.innerHTML = `<div class="popup-title">Playlists &mdash; &uarr;/&darr; move &middot; Enter play &middot; n new &middot; Esc close</div><div id="popup-list"></div>`;
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        if (!playlists.length) {
            const row = document.createElement("div");
            row.className = "popup-row";
            row.textContent = "No playlists found.";
            listEl.appendChild(row);
        } else {
            playlists.forEach((p, idx) => {
                const row = document.createElement("div");
                row.className = "popup-row" + (idx === popupSelected ? " selected" : "");
                row.textContent = `${idx + 1}. ${p.name}`;
                listEl.appendChild(row);
            });
        }
        popup.addEventListener("keydown", handleListKeydown);
        popup.focus();
    } else if (popupMode === "new") {
        popup.innerHTML = `<div class="popup-title">New playlist name &mdash; Enter confirm &middot; Esc cancel</div><input id="popup-input" class="popup-input">`;
        document.body.appendChild(popup);
        const inputEl = popup.querySelector("#popup-input");
        inputEl.focus();
        inputEl.addEventListener("keydown", handleNewKeydown);
    } else if (popupMode === "tracks") {
        // The title can carry a user-typed search query, so it is set as text rather than markup.
        popup.innerHTML = `<div id="popup-list"></div>`;
        const titleEl = document.createElement("div");
        titleEl.className = "popup-title";
        titleEl.textContent = `${popupTrackTitle} \u2014 \u2191/\u2193 move \u00b7 Enter play \u00b7 a queue \u00b7 Esc close`;
        popup.prepend(titleEl);
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        if (!popupTracks.length) {
            const row = document.createElement("div");
            row.className = "popup-row";
            row.textContent = "No tracks found.";
            listEl.appendChild(row);
        } else {
            popupTracks.forEach((track, idx) => {
                const row = document.createElement("div");
                row.className = "popup-row" + (idx === popupTrackSelected ? " selected" : "");
                row.textContent = `${idx + 1}. ${track.name}${track.artist ? " - " + track.artist : ""}`;
                listEl.appendChild(row);
            });
        }
        popup.addEventListener("keydown", handleTrackListKeydown);
        popup.focus();
        scrollSelectedPopupRowIntoView();
    } else if (popupMode === "themes") {
        popup.innerHTML = `<div class="popup-title">Theme &mdash; &uarr;/&darr; preview &middot; Enter keep &middot; a follow Spicetify &middot; Esc cancel</div><div id="popup-list"></div>`;
        document.body.appendChild(popup);
        const listEl = popup.querySelector("#popup-list");
        SPOTUI_SCHEMES.forEach((scheme, idx) => {
            const row = document.createElement("div");
            row.className = "popup-row" + (idx === popupSchemeSelected ? " selected" : "");
            row.textContent = `${idx + 1}. ${scheme.label}${scheme.id === popupSchemeOriginal ? " (current)" : ""}`;
            listEl.appendChild(row);
        });
        popup.addEventListener("keydown", handleThemeKeydown);
        popup.focus();
        scrollSelectedPopupRowIntoView();
    } else if (popupMode === "help") {
        const category = HELP_CATEGORIES[popupHelpCategory];
        const title = category
            ? `Help / ${category.label} \u2014 \u2191/\u2193 move \u00b7 Esc back`
            : `Help \u2014 \u2191/\u2193 move \u00b7 Enter open \u00b7 Esc close`;

        popup.innerHTML = `<div id="popup-list"></div>`;
        const titleEl = document.createElement("div");
        titleEl.className = "popup-title";
        titleEl.textContent = title;
        popup.prepend(titleEl);
        document.body.appendChild(popup);

        const listEl = popup.querySelector("#popup-list");
        const rows = category
            ? category.entries.map((entry) => [entry[0], entry[1]])
            : HELP_CATEGORIES.map((item) => [item.label, `${item.entries.length} commands`]);

        rows.forEach(([usage, description], idx) => {
            const row = document.createElement("div");
            row.className = "popup-row" + (idx === popupHelpSelected ? " selected" : "");

            const cmd = document.createElement("span");
            cmd.className = "popup-row-cmd";
            cmd.textContent = usage;

            const desc = document.createElement("span");
            desc.className = "popup-row-desc";
            desc.textContent = description;

            row.append(cmd, desc);
            listEl.appendChild(row);
        });

        popup.addEventListener("keydown", handleHelpKeydown);
        popup.focus();
        scrollSelectedPopupRowIntoView();
    }
}

function scrollSelectedPopupRowIntoView() {
    requestAnimationFrame(() => {
        const selectedRow = popup?.querySelector(".popup-row.selected");
        if (selectedRow?.scrollIntoView) {
            selectedRow.scrollIntoView({ block: "nearest" });
        }
    });
}

function handleListKeydown(e) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (playlists.length) popupSelected = (popupSelected + 1) % playlists.length;
        renderPopup();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (playlists.length) popupSelected = (popupSelected - 1 + playlists.length) % playlists.length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const p = playlists[popupSelected];
        if (p) {
            lastPlaylistContextUri = p.uri;
            Spicetify.Player.playUri(p.uri);
            print("Playing playlist: " + p.name);
        }
        closePopup();
    } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        popupMode = "new";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleTrackListKeydown(e) {
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (popupTracks.length) popupTrackSelected = (popupTrackSelected + 1) % popupTracks.length;
        renderPopup();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (popupTracks.length) popupTrackSelected = (popupTrackSelected - 1 + popupTracks.length) % popupTracks.length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const track = popupTracks[popupTrackSelected];
        if (track?.uri) {
            Spicetify.Player.playUri(track.uri, popupTrackContext || undefined);
            print("Playing: " + track.name);
        }
        if (popupTrackTitle === "Queue") {
            lastQueueSnapshot = popupTracks.slice();
        }
        closePopup();
    } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        const track = popupTracks[popupTrackSelected];
        if (track?.uri) {
            queueTrack(track.uri)
                .then(() => print(`Queued: ${formatTrackLabel(track)}`))
                .catch((err) => print("Queue error: " + err.message, "error"));
        }
    } else if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleThemeKeydown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        popupSchemeSelected = (popupSchemeSelected + delta + SPOTUI_SCHEMES.length) % SPOTUI_SCHEMES.length;
        applyScheme(SPOTUI_SCHEMES[popupSchemeSelected].id);
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const scheme = SPOTUI_SCHEMES[popupSchemeSelected];
        applyScheme(scheme.id);
        storeScheme(scheme.id);
        closePopup();
        print(`Theme: ${scheme.label}`);
    } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        applyScheme(null);
        storeScheme(null);
        closePopup();
        print("Theme: following the Spicetify scheme");
    } else if (e.key === "Escape") {
        e.preventDefault();
        applyScheme(popupSchemeOriginal);
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleHelpKeydown(e) {
    const category = HELP_CATEGORIES[popupHelpCategory];
    const length = category ? category.entries.length : HELP_CATEGORIES.length;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        popupHelpSelected = (popupHelpSelected + delta + length) % length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (category) {
            closePopup();
            return;
        }
        popupHelpCategory = popupHelpSelected;
        popupHelpSelected = 0;
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        if (!category) {
            closePopup();
            return;
        }
        popupHelpSelected = popupHelpCategory;
        popupHelpCategory = null;
        renderPopup();
    }
    scrollSelectedPopupRowIntoView();
}

async function handleNewKeydown(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const name = e.target.value.trim();
        if (!name) return;
        try {
            await Spicetify.Platform.RootlistAPI.createPlaylist(name, {});
            print("Created playlist: " + name);
        } catch (err) {
            print("Create failed: " + err.message + " (check console)", "error");
            console.error("Create playlist error:", err);
        }
        playlists = await getPlaylists();
        popupSelected = 0;
        popupMode = "list";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupMode = "list";
        renderPopup();
    }
}

injectStyle();
applyScheme(readStoredScheme());
restoreBackdrop();
setTimeout(createCopyButton, 500);
setTimeout(initLyricsBridge, 1000);

// Spotify's own stylesheet may land after ours, so re-read the scheme once it settles.
setTimeout(() => applyScheme(activeSchemeId), 1500);

if (Spicetify?.Platform) {
    createTerminal();
} else {
    setTimeout(createTerminal, 1500);
}

})();
