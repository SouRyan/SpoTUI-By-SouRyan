(function () {

const SPOTUI_VERSION = "1.2.0";
const SPOTUI_REPO = "SouRyan/SpoTUI-By-SouRyan";
const SPOTUI_CDN_BASE = `https://cdn.jsdelivr.net/gh/${SPOTUI_REPO}`;
const SPOTUI_VERSION_URL =
    `https://raw.githubusercontent.com/${SPOTUI_REPO}/master/version.json`;
const ACTIVE_VERSION_KEY = "spotui:active-version";
const DISMISSED_VERSION_KEY = "spotui:dismissed-version";
const REMOTE_CSS_ID = "spotui-remote-css";

function readActiveVersion() {
    try {
        return localStorage.getItem(ACTIVE_VERSION_KEY) || SPOTUI_VERSION;
    } catch {
        return SPOTUI_VERSION;
    }
}

function storeActiveVersion(version) {
    try {
        localStorage.setItem(ACTIVE_VERSION_KEY, version);
    } catch {
        /* ignore */
    }
}

function readDismissedVersion() {
    try {
        return localStorage.getItem(DISMISSED_VERSION_KEY) || "";
    } catch {
        return "";
    }
}

function storeDismissedVersion(version) {
    try {
        if (version) localStorage.setItem(DISMISSED_VERSION_KEY, version);
        else localStorage.removeItem(DISMISSED_VERSION_KEY);
    } catch {
        /* ignore */
    }
}

function cdnTagUrl(version, file) {
    return `${SPOTUI_CDN_BASE}@v${encodeURIComponent(version)}/${file}`;
}

function injectRemoteUserCss(version) {
    let link = document.getElementById(REMOTE_CSS_ID);
    if (!link) {
        link = document.createElement("link");
        link.id = REMOTE_CSS_ID;
        link.rel = "stylesheet";
        (document.head || document.documentElement).appendChild(link);
    }
    link.href = `${cdnTagUrl(version, "user.css")}?t=${Date.now()}`;
}

function loadRemoteTheme(version) {
    injectRemoteUserCss(version);
    const script = document.createElement("script");
    script.src = `${cdnTagUrl(version, "theme.js")}?t=${Date.now()}`;
    script.onerror = () => {
        console.error(`SpoTUI: failed to load v${version} from CDN, falling back to bundled`);
        try {
            localStorage.removeItem(ACTIVE_VERSION_KEY);
        } catch {
            /* ignore */
        }
        window.__SPOTUI_LOADING_REMOTE__ = false;
        location.reload();
    };
    (document.head || document.documentElement).appendChild(script);
}

const spotuiActiveVersion = readActiveVersion();
if (
    spotuiActiveVersion !== SPOTUI_VERSION &&
    !window.__SPOTUI_LOADING_REMOTE__ &&
    !window.__SPOTUI_RUNNING__
) {
    window.__SPOTUI_LOADING_REMOTE__ = true;
    loadRemoteTheme(spotuiActiveVersion);
    return;
}
window.__SPOTUI_RUNNING__ = true;

const style = `
:root {
    --spotui-font: "JetBrains Mono", "Fira Code", monospace;
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
    font-family: var(--spotui-font);
    font-size: 15px;
    padding: 40px;
    box-sizing: border-box;
    z-index: 20000;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    user-select: text;
    cursor: text;
    contain: layout style;
    isolation: isolate;
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
    contain: paint;
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
    text-align: center;
    font-family: var(--spotui-font);
    pointer-events: none;
    user-select: none;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    contain: layout style paint;
    content-visibility: auto;
}

.spotui-wordmark {
    font-size: clamp(42px, 8vw, 88px);
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
    color: var(--spotui-accent);
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
}

body.spotui-command-mode #spotui-output {
    display: none !important;
}

body.spotui-cli-mode #spotui-output {
    display: flex !important;
}

body.spotui-pane-mode #spotui-logo,
body.spotui-pane-mode #spotui-output {
    display: none !important;
}

body.spotui-pane-mode #spotui-panes {
    display: flex !important;
}

body.spotui-lyrics-panel #spotui-logo,
body.spotui-lyrics-panel #spotui-output,
body.spotui-lyrics-panel #spotui-panes {
    display: none !important;
}

body.spotui-lyrics-panel #spotui-lyrics {
    display: flex;
}

#spotui-lyrics {
    display: none;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    position: relative;
    z-index: 1;
    margin: 0 0 8px;
    border: 1px solid rgba(var(--spotui-accent-rgb), 0.28);
    background:
        radial-gradient(120% 80% at 50% 0%, rgba(var(--spotui-accent-rgb), 0.14), transparent 55%),
        rgba(var(--spotui-accent-rgb), 0.04);
    overflow: hidden;
}

.spotui-lyrics-header {
    flex: 0 0 auto;
    padding: 16px 22px 12px;
    border-bottom: 1px solid rgba(var(--spotui-accent-rgb), 0.18);
}

.spotui-lyrics-kicker {
    color: var(--spotui-accent);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.spotui-lyrics-track {
    color: var(--spotui-text);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.spotui-lyrics-meta {
    margin-top: 4px;
    color: var(--spotui-muted);
    font-size: 12px;
    letter-spacing: 0.02em;
}

.spotui-lyrics-viewport {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.spotui-lyrics-lines {
    height: 100%;
    overflow-y: auto;
    padding: 18vh 28px;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    text-align: center;
}

.spotui-lyrics-lines::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.spotui-lyrics-fade {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    height: 72px;
    z-index: 2;
}

.spotui-lyrics-fade-top {
    top: 0;
    background: linear-gradient(180deg, var(--spotui-bg), transparent);
}

.spotui-lyrics-fade-bottom {
    bottom: 0;
    background: linear-gradient(0deg, var(--spotui-bg), transparent);
}

.spotui-lyrics-line {
    color: var(--spotui-dim);
    font-size: 17px;
    line-height: 1.45;
    padding: 10px 8px;
    opacity: 0.45;
    transform: scale(0.96);
    transition:
        color 220ms ease,
        opacity 220ms ease,
        transform 220ms ease,
        text-shadow 220ms ease;
}

.spotui-lyrics-line.near {
    color: var(--spotui-muted);
    opacity: 0.72;
    transform: scale(0.98);
}

.spotui-lyrics-line.active {
    color: var(--spotui-accent);
    opacity: 1;
    transform: scale(1.06);
    font-weight: 600;
    text-shadow: 0 0 18px rgba(var(--spotui-accent-rgb), 0.35);
}

.spotui-lyrics-lines.unsynced .spotui-lyrics-line {
    color: var(--spotui-muted);
    opacity: 0.9;
    transform: none;
    text-align: center;
}

.spotui-lyrics-empty {
    color: var(--spotui-muted);
    font-size: 15px;
    line-height: 1.6;
    padding: 18vh 24px;
    text-align: center;
}

.spotui-lyrics-empty strong {
    display: block;
    color: var(--spotui-accent);
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 600;
}

#spotui-panes {
    display: none;
    flex: 1 1 auto;
    flex-direction: row;
    gap: 12px;
    min-height: 0;
    position: relative;
    z-index: 1;
}

#spotui-panes[hidden],
#spotui-lyrics[hidden] {
    content-visibility: hidden;
    contain: strict;
}

.spotui-pane {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(var(--spotui-accent-rgb), 0.28);
    background: rgba(0, 0, 0, 0.25);
    outline: none;
}

.spotui-pane.active {
    border-color: var(--spotui-accent);
    box-shadow: inset 0 0 0 1px rgba(var(--spotui-accent-rgb), 0.25);
}

.spotui-pane-title {
    color: var(--spotui-accent);
    font-size: 12px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--spotui-divider);
    flex: 0 0 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.spotui-pane-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 6px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.spotui-pane-list::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.spotui-pane-row {
    padding: 4px 6px;
    cursor: default;
}

.spotui-pane-row.selected {
    background: var(--spotui-accent);
    color: var(--spotui-contrast);
}

.spotui-pane-row.is-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--spotui-dim);
    overflow: hidden;
    white-space: nowrap;
}

.spotui-pane-row.is-header::before,
.spotui-pane-row.is-header::after {
    content: "────────────────────────────────────────────────────────────────";
    flex: 1 1 0;
    min-width: 2ch;
    overflow: hidden;
    white-space: nowrap;
}

.spotui-pane-row.is-header.selected {
    color: var(--spotui-contrast);
}

.spotui-pane-empty {
    color: var(--spotui-dim);
    padding: 8px 6px;
}

#spotui-output::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#spotui-status {
    min-height: 20px;
    padding: 2px 0;
    margin-top: auto;
    color: var(--spotui-muted);
    font-size: 13px;
    white-space: pre-wrap;
    position: relative;
    z-index: 1;
    opacity: 0;
    transition: opacity 200ms ease;
    flex: 0 0 auto;
}

#spotui-status.visible {
    opacity: 1;
}

#spotui-status.error {
    color: var(--spotui-error);
}

#spotui-nowplaying {
    position: relative;
    z-index: 1;
    margin-top: 8px;
    padding: 10px 12px;
    border: 1px solid rgba(var(--spotui-accent-rgb), 0.28);
    background: rgba(var(--spotui-accent-rgb), 0.06);
    font-size: 13px;
    line-height: 1.45;
    user-select: text;
    flex: 0 0 auto;
    contain: layout style;
}

#spotui-nowplaying.empty {
    color: var(--spotui-dim);
    border-style: dashed;
}

.spotui-np-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
}

.spotui-np-row + .spotui-np-row {
    margin-top: 4px;
}

.spotui-np-state {
    color: var(--spotui-accent);
    flex: 0 0 auto;
    min-width: 1.5ch;
}

.spotui-np-title {
    color: var(--spotui-text);
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.spotui-np-meta {
    color: var(--spotui-muted);
    flex: 0 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45%;
}

.spotui-np-bar {
    flex: 1 1 auto;
    min-width: 80px;
    max-width: 220px;
    display: flex;
    align-items: center;
}

.spotui-np-bar-track {
    display: block;
    width: 100%;
    height: 5px;
    border-radius: 999px;
    background: rgba(var(--spotui-accent-rgb), 0.14);
    box-shadow: inset 0 0 0 1px rgba(var(--spotui-accent-rgb), 0.22);
    overflow: hidden;
}

.spotui-np-bar-fill {
    display: block;
    height: 100%;
    width: 100%;
    border-radius: inherit;
    background: var(--spotui-accent);
    transform: scaleX(0);
    transform-origin: left center;
    will-change: transform;
}

#spotui-nowplaying.empty .spotui-np-bar-track {
    background: rgba(255, 255, 255, 0.04);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

#spotui-nowplaying.empty .spotui-np-bar-fill {
    transform: scaleX(0) !important;
}

.spotui-np-clock {
    color: var(--spotui-muted);
    flex: 0 0 auto;
    white-space: nowrap;
}

#spotui-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    margin-top: 0;
    border-top: 1px solid rgba(var(--spotui-accent-rgb), 0.18);
    position: relative;
    z-index: 1;
    contain: layout style;
}

#spotui-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--spotui-accent);
    caret-color: var(--spotui-accent);
    font-family: inherit;
    font-size: inherit;
    font-kerning: none;
    font-variant-ligatures: none;
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
    font-family: var(--spotui-font);
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

body.spotui-bar-hidden #spotui-tui {
    bottom: 0;
}

body.spotui-tui-hidden #spotui-popup {
    display: none !important;
}

#spotui-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    width: min(480px, calc(100% - 32px));
    max-height: min(60vh, calc(100% - 48px));
    background: var(--spotui-bg);
    border: 2px solid var(--spotui-accent);
    border-radius: 6px;
    color: var(--spotui-text);
    font-family: var(--spotui-font);
    font-size: 14px;
    z-index: 20050;
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
.popup-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid var(--spotui-divider);
    margin-right: 8px;
    vertical-align: middle;
    box-sizing: border-box;
}
.popup-row.selected .popup-swatch {
    border-color: var(--spotui-contrast);
}
.popup-row-token {
    display: inline-block;
    min-width: 10ch;
}
.popup-row-hex {
    color: var(--spotui-muted);
    margin-left: 6px;
}
.popup-row.selected .popup-row-hex {
    color: var(--spotui-contrast);
    opacity: 0.8;
}
#spotui-popup.theme-custom-popup {
    width: min(520px, calc(100% - 32px));
}
.popup-font-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 5px;
}
.popup-font-option {
    min-width: 0;
    padding: 7px 6px;
    border: 1px solid transparent;
    background: var(--spotui-surface);
    color: var(--spotui-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
}
.popup-font-option.selected {
    border-color: var(--spotui-accent);
    background: var(--spotui-accent);
    color: var(--spotui-contrast);
}
.popup-update-notes {
    color: var(--spotui-text);
    line-height: 1.45;
    margin: 8px 0 16px;
    white-space: pre-wrap;
}
.popup-update-meta {
    color: var(--spotui-muted);
    font-size: 12px;
    margin-bottom: 12px;
}
.popup-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.popup-btn {
    flex: 1;
    min-width: 110px;
    padding: 8px 12px;
    border: 1px solid var(--spotui-accent);
    background: var(--spotui-accent);
    color: var(--spotui-contrast);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
}
.popup-btn.secondary {
    background: transparent;
    color: var(--spotui-accent);
}
.popup-btn:hover {
    filter: brightness(1.08);
}
.popup-btn:focus {
    outline: 1px solid var(--spotui-text);
    outline-offset: 2px;
}
`;

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

const CUSTOM_SCHEME_ID = "custom";
const DEFAULT_CUSTOM_SCHEME = {
    id: CUSTOM_SCHEME_ID,
    label: "Custom",
    accent: "#ff8c42",
    bg: "#0a0a0a",
    surface: "#111111",
    text: "#e6e6e6",
    muted: "#b3b3b3",
    divider: "#2a2a2a",
    error: "#ff5555",
    font: "JetBrains Mono",
};
const SCHEME_COLOR_TOKENS = ["accent", "bg", "surface", "text", "muted", "divider", "error"];
const CUSTOM_THEME_TOKENS = [...SCHEME_COLOR_TOKENS, "font"];
const SPOTUI_FONTS = [
    "Adwaita Mono", "Atkinson Hyperlegible", "Boon", "Cascadia Mono",
    "Comfortaa", "Helvetica", "Coming Soon", "CommitMono", "Courier",
    "Fira Code", "Geist", "Geist Mono", "Georgia", "Hack",
    "IBM Plex Mono", "IBM Plex Sans", "Inconsolata", "Inter Tight",
    "Iosevka", "Itim", "JetBrains Mono", "Kanit", "Lalezar", "Lato",
    "Lexend Deca", "Mononoki", "Montserrat", "Noto Naskh Arabic",
    "Noto Sans Lao", "Nunito", "Open Dyslexic", "Overpass Mono",
    "Oxygen", "Parkinsans", "Proto", "Roboto", "Roboto Mono",
    "Sarabun", "Source Code Pro", "Space Grotesk", "Titillium Web",
    "Ubuntu", "Ubuntu Mono", "Victor Mono", "Fira Mono",
];
const DEFAULT_SPOTUI_FONT = "JetBrains Mono";
const GOOGLE_FONTS = new Set([
    "Atkinson Hyperlegible", "Boon", "Comfortaa", "Coming Soon", "CommitMono",
    "Fira Code", "Geist", "Geist Mono", "IBM Plex Mono", "IBM Plex Sans",
    "Inconsolata", "Inter Tight", "Itim", "JetBrains Mono", "Kanit", "Lalezar",
    "Lato", "Lexend Deca", "Montserrat", "Noto Naskh Arabic", "Noto Sans Lao",
    "Nunito", "Oxygen", "Parkinsans", "Roboto", "Roboto Mono", "Sarabun",
    "Source Code Pro", "Space Grotesk", "Titillium Web", "Ubuntu", "Ubuntu Mono",
    "Victor Mono",
]);
const SCHEME_TOKEN_LABELS = {
    accent: "accent",
    bg: "background",
    surface: "surface",
    text: "text",
    muted: "muted",
    divider: "divider",
    error: "error",
    font: "font",
};

const SCHEME_STORAGE_KEY = "spotui:scheme";
const CUSTOM_SCHEME_STORAGE_KEY = "spotui:custom-scheme";
const SCHEME_SURFACE_TOKENS = ["bg", "surface", "text", "muted", "divider", "error"];

const BACKDROP_STORAGE_KEY = "spotui:backdrop";
const BACKDROP_OPACITY_STORAGE_KEY = "spotui:backdrop-opacity";
const BAR_STORAGE_KEY = "spotui:player-bar-hidden";
const PIP_WIDTH = 320;
const PIP_HEIGHT = 420;

let backdropUrl = "";
let backdropOpacity = 0.35;
let playerBarHidden = false;
let pipWindow = null;
let pipEventsBound = false;
let pipProgressRaf = null;

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

function toHexByte(value) {
    return clampNumber(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHex({ r, g, b }) {
    return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

function normalizeFontName(value) {
    const font = String(value || "").trim().slice(0, 80);
    return font && !/[;"{}]/.test(font) ? font : DEFAULT_SPOTUI_FONT;
}

function fontFamilyValue(font) {
    const normalized = normalizeFontName(font);
    const mono = /mono|code|courier|hack|iosevka|mononoki/i.test(normalized);
    return `${JSON.stringify(normalized)}, ${mono ? "monospace" : "system-ui, sans-serif"}`;
}

function ensureFontLoaded(font) {
    const normalized = normalizeFontName(font);
    if (!GOOGLE_FONTS.has(normalized) || !document.head) return;
    const id = `spotui-font-${normalized.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalized)}:wght@400;500;600&display=swap`;
    document.head.appendChild(link);
}

function normalizeCustomScheme(raw) {
    const scheme = {
        id: CUSTOM_SCHEME_ID,
        label: "Custom",
        accent: DEFAULT_CUSTOM_SCHEME.accent,
        bg: DEFAULT_CUSTOM_SCHEME.bg,
        surface: DEFAULT_CUSTOM_SCHEME.surface,
        text: DEFAULT_CUSTOM_SCHEME.text,
        muted: DEFAULT_CUSTOM_SCHEME.muted,
        divider: DEFAULT_CUSTOM_SCHEME.divider,
        error: DEFAULT_CUSTOM_SCHEME.error,
        font: DEFAULT_CUSTOM_SCHEME.font,
    };

    if (!raw || typeof raw !== "object") return scheme;

    SCHEME_COLOR_TOKENS.forEach((token) => {
        const parsed = parseColor(raw[token]);
        if (parsed) scheme[token] = rgbToHex(parsed);
    });
    scheme.font = normalizeFontName(raw.font);

    return scheme;
}

function readCustomScheme() {
    try {
        const raw = localStorage.getItem(CUSTOM_SCHEME_STORAGE_KEY);
        if (!raw) return normalizeCustomScheme(null);
        return normalizeCustomScheme(JSON.parse(raw));
    } catch {
        return normalizeCustomScheme(null);
    }
}

function storeCustomScheme(scheme) {
    try {
        const normalized = normalizeCustomScheme(scheme);
        localStorage.setItem(
            CUSTOM_SCHEME_STORAGE_KEY,
            JSON.stringify({
                accent: normalized.accent,
                bg: normalized.bg,
                surface: normalized.surface,
                text: normalized.text,
                muted: normalized.muted,
                divider: normalized.divider,
                error: normalized.error,
                font: normalized.font,
            })
        );
        return normalized;
    } catch {
        return normalizeCustomScheme(scheme);
    }
}

function getAllSchemes() {
    return [...SPOTUI_SCHEMES, readCustomScheme()];
}

function cloneScheme(scheme) {
    return normalizeCustomScheme(scheme);
}

function schemeFromColors(colors) {
    return normalizeCustomScheme(colors);
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
    const schemes = getAllSchemes();
    return (
        schemes.find((scheme) => scheme.id === needle) ||
        schemes.find((scheme) => scheme.label.toLowerCase() === needle) ||
        schemes.find((scheme) => scheme.label.toLowerCase().startsWith(needle)) ||
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

function applySchemeColors(scheme) {
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
    const font = scheme?.font || DEFAULT_SPOTUI_FONT;
    ensureFontLoaded(font);
    root.style.setProperty("--spotui-font", fontFamilyValue(font));

    SCHEME_SURFACE_TOKENS.forEach((token) => {
        if (scheme) root.style.setProperty(`--spotui-${token}`, scheme[token]);
        else root.style.removeProperty(`--spotui-${token}`);
    });

}

// Passing null follows whatever scheme Spicetify applied through --spice-*.
function applyScheme(schemeId) {
    const scheme = findScheme(schemeId);
    activeSchemeId = scheme ? scheme.id : null;
    applySchemeColors(scheme);
}

function previewSchemeColors(scheme) {
    applySchemeColors(scheme ? schemeFromColors(scheme) : null);
}

function initAsciiAnimation() {
    const logo = document.getElementById("spotui-logo");
    if (!logo || logo.querySelector(".spotui-wordmark")) return;
    logo.innerHTML = "";
    const name = document.createElement("div");
    name.className = "spotui-wordmark";
    name.textContent = "SpoTUI";
    logo.appendChild(name);
}

const STATUS_TIMEOUT_MS = 5000;
const LYRICS_POLL_MS = 8000;
const PLAYLIST_PAGE_SIZE = 200;
const PLAYLIST_MAX_TRACKS = 10000;
const SEARCH_RESULT_LIMIT = 50;
const SEARCH_TRACK_LIMIT = 50;
const SEARCH_ALBUM_LIMIT = 50;
const SEARCH_ARTIST_LIMIT = 50;
const SEARCH_MIX_LIMIT = 10;
const ARTIST_ALBUMS_PAGE = 50;
const ARTIST_ALBUMS_MAX = 1000;
const ARTIST_APPEARS_MAX = 100;

let tuiMode = "command";

let commandHistory = [];
let historyIndex = -1;
let historyDraft = "";
let lyricsBridgeBound = false;

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

function findSpotifySearchHost() {
    return document.querySelector(
        ".main-globalNav-searchContainer, .main-globalNav-searchSection, .main-globalNav-searchInputContainer, .main-topBar-searchBar"
    );
}

let backBtnDockTimer = null;
let backBtnRef = null;

function syncBackButtonDock() {
    const btn = backBtnRef || document.getElementById("spotui-back-btn");
    if (!btn) return;

    const docked =
        document.body.classList.contains("spotui-spotify-enabled") ||
        document.body.classList.contains("spotui-search-mode");
    if (!docked) {
        if (btn.parentElement !== document.body) document.body.appendChild(btn);
        return;
    }

    const host = findSpotifySearchHost();
    if (!host) {
        if (btn.parentElement !== document.body) document.body.appendChild(btn);
        return;
    }
    if (btn.parentElement !== host) host.appendChild(btn);
}

function startBackButtonDock() {
    stopBackButtonDock(false);
    syncBackButtonDock();
    [50, 200, 600].forEach((ms) => setTimeout(syncBackButtonDock, ms));
    backBtnDockTimer = setInterval(syncBackButtonDock, 500);
}

function stopBackButtonDock(detach = true) {
    if (backBtnDockTimer) {
        clearInterval(backBtnDockTimer);
        backBtnDockTimer = null;
    }
    if (!detach) return;
    const btn = backBtnRef || document.getElementById("spotui-back-btn");
    if (btn && btn.parentElement !== document.body) document.body.appendChild(btn);
}

function createCopyButton() {
    const controls = document.createElement("div");
    controls.id = "spotui-controls";

    const copyBtn = document.createElement("button");
    copyBtn.id = "copy-log-btn";
    copyBtn.className = "spotui-control-btn";
    copyBtn.type = "button";
    copyBtn.tabIndex = -1;
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
    hideBtn.type = "button";
    hideBtn.tabIndex = -1;
    hideBtn.textContent = "Hide TUI";
    hideBtn.addEventListener("click", () => {
        const hidden = document.body.classList.toggle("spotui-tui-hidden");
        hideBtn.textContent = hidden ? "Show TUI" : "Hide TUI";
        if (
            document.body.classList.contains("spotui-spotify-enabled") ||
            document.body.classList.contains("spotui-search-mode")
        ) {
            startBackButtonDock();
        } else {
            stopBackButtonDock();
        }
    });

    const spotifyBtn = document.createElement("button");
    spotifyBtn.id = "enable-spotify-btn";
    spotifyBtn.className = "spotui-control-btn";
    spotifyBtn.type = "button";
    spotifyBtn.tabIndex = -1;
    spotifyBtn.textContent = "Enable Spotify";
    spotifyBtn.addEventListener("click", () => {
        const enabled = document.body.classList.toggle("spotui-spotify-enabled");
        if (enabled) {
            document.body.classList.add("spotui-tui-hidden");
            hideBtn.textContent = "Show TUI";
            spotifyBtn.textContent = "Disable Spotify";
            startBackButtonDock();
        } else {
            spotifyBtn.textContent = "Enable Spotify";
            document.body.classList.remove("spotui-tui-hidden");
            document.body.classList.remove("spotui-search-mode");
            hideBtn.textContent = "Hide TUI";
            stopBackButtonDock();
            if (!playerBarHidden) schedulePlayerBarKeepMarks();
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
    backBtn.type = "button";
    backBtn.tabIndex = -1;
    backBtn.textContent = "Back";
    backBtn.style.setProperty("-webkit-app-region", "no-drag");
    backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.remove("spotui-search-mode");
        document.body.classList.remove("spotui-spotify-enabled");
        document.body.classList.remove("spotui-tui-hidden");
        spotifyBtn.textContent = "Enable Spotify";
        hideBtn.textContent = "Hide TUI";
        stopBackButtonDock();
        if (!playerBarHidden) schedulePlayerBarKeepMarks();
        syncLyricsState();
    });
    backBtnRef = backBtn;
    document.body.appendChild(backBtn);
}

function detectLyricsSurface() {
    return Boolean(
        document.querySelector(
            ".main-nowPlayingView-lyricsContent, .main-lyricsCinema-container, .lyrics-lyricsContainer-LyricsContainer, [data-testid='fullscreen-lyric-lines-view']"
        )
    );
}

function syncLyricsState() {
    if (!document.body) return;
    document.body.classList.toggle("spotui-lyrics-open", detectLyricsSurface());
}

function hookLyricsButton() {
    const button = document.querySelector(
        ".main-nowPlayingBar-lyricsButton, [data-testid='now-playing-bar'] button[aria-label*='lyric' i], [data-testid='now-playing-bar'] button[aria-label*='letra' i]"
    );
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

    refresh();
    if (lyricsBridgeBound) return;
    lyricsBridgeBound = true;

    document.addEventListener(
        "click",
        (e) => {
            const btn = e.target?.closest?.(
                ".main-nowPlayingBar-lyricsButton, [data-testid='now-playing-bar'] button"
            );
            if (!btn) return;
            const label = `${btn.getAttribute("aria-label") || ""} ${btn.getAttribute("title") || ""}`;
            if (
                !btn.classList.contains("main-nowPlayingBar-lyricsButton") &&
                !/lyric|letra/i.test(label)
            ) {
                return;
            }
            setTimeout(refresh, 50);
            setTimeout(refresh, 400);
        },
        true
    );

    const poll = setInterval(refresh, LYRICS_POLL_MS);
    window.addEventListener(
        "beforeunload",
        () => {
            clearInterval(poll);
        },
        { once: true }
    );
}

function createTerminal() {
    const box = document.createElement("div");
    box.id = "spotui-tui";
    setTuiMode("command");
    box.innerHTML = `
<div id="spotui-backdrop"></div>
<div id="spotui-logo"></div>
<div id="spotui-output">LazyUI v${SPOTUI_VERSION}

Type /help

</div>
<div id="spotui-panes" hidden>
<div class="spotui-pane" id="spotui-pane-left" tabindex="-1">
<div class="spotui-pane-title"></div>
<div class="spotui-pane-list"></div>
</div>
<div class="spotui-pane" id="spotui-pane-right" tabindex="-1">
<div class="spotui-pane-title"></div>
<div class="spotui-pane-list"></div>
</div>
</div>
<div id="spotui-lyrics" hidden>
<div class="spotui-lyrics-header">
<div class="spotui-lyrics-kicker">lyrics</div>
<div class="spotui-lyrics-track">Nothing playing</div>
<div class="spotui-lyrics-meta"></div>
</div>
<div class="spotui-lyrics-viewport">
<div class="spotui-lyrics-fade spotui-lyrics-fade-top"></div>
<div class="spotui-lyrics-lines"></div>
<div class="spotui-lyrics-fade spotui-lyrics-fade-bottom"></div>
</div>
</div>
<div id="spotui-status"></div>
<div id="spotui-nowplaying" class="empty" aria-live="polite">
<div class="spotui-np-row">
<span class="spotui-np-state">-</span>
<span class="spotui-np-title">Nothing playing</span>
<span class="spotui-np-meta"></span>
</div>
<div class="spotui-np-row">
<span class="spotui-np-bar"><span class="spotui-np-bar-track"><span class="spotui-np-bar-fill"></span></span></span>
<span class="spotui-np-clock"></span>
</div>
</div>
<div id="spotui-footer">
<span class="prompt">></span>
<input id="spotui-input" autofocus placeholder="type help · tab to complete" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" data-gramm="false">
</div>
`;
    document.body.appendChild(box);
    initAsciiAnimation();
    renderBackdrop();
    initNowPlayingBar();
    initPanes();
    bindQueueEvents();
    try {
        if (localStorage.getItem(LYRICS_STORAGE_KEY) === "1") {
            openLyricsPanel();
        }
    } catch {
        /* ignore */
    }

    const input = document.getElementById("spotui-input");
    bindSpotuiFocusGuards(box, input);

    // Capture Tab before it can move focus to control buttons / Spotify chrome.
    box.addEventListener(
        "keydown",
        (e) => {
            if (e.key !== "Tab") return;
            if (paneMode) return;

            const target = e.target;
            if (
                target &&
                target !== input &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable)
            ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            if (document.activeElement !== input) input.focus();
            handleTabComplete(input);
        },
        true
    );

    input.addEventListener("keydown", async (e) => {
        markSpotuiTyping();
        if (lyricsPanelOpen && e.key === "Escape") {
            e.preventDefault();
            closeLyricsPanel();
            print("Lyrics closed");
            return;
        }

        if (paneMode && (e.key === "Escape" || e.key === "Tab")) {
            e.preventDefault();
            if (e.key === "Escape") {
                if (paneMode === "search" && handleSearchPaneEscape()) return;
                if ((paneMode === "browse" || paneMode === "home") && paneDrilledDown) {
                    clearPaneRight();
                    return;
                }
                closePanes();
                return;
            }
            focusPane(e.shiftKey ? "left" : "right");
            return;
        }

        if (e.key === "Enter") {
            autocompleteSession = null;
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
            autocompleteSession = null;
            recallHistory(input, -1);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            autocompleteSession = null;
            recallHistory(input, 1);
        }
    });

    input.addEventListener("input", () => {
        markSpotuiTyping();
        autocompleteSession = null;
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

const PLAYER_UNAVAILABLE =
    "Player API unavailable. Update Spicetify to 2.45.0+ for Spotify 1.3.0 (spicetify update, then spicetify backup apply)";

function getPlayerOrigin() {
    return Spicetify?.Player?.origin || Spicetify?.Platform?.PlayerAPI || null;
}

function playerIsReady() {
    return Boolean(getPlayerOrigin() || Spicetify?.Platform?.PlaybackAPI);
}

function playerIsPlaying() {
    try {
        if (Spicetify?.Player?.origin && typeof Spicetify.Player.isPlaying === "function") {
            return Spicetify.Player.isPlaying();
        }
        const state = getPlayerOrigin()?._state;
        return Boolean(state && !state.isPaused);
    } catch {
        return false;
    }
}

function playerTogglePlay() {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.togglePlay === "function") {
        return Spicetify.Player.togglePlay();
    }
    const api = getPlayerOrigin();
    if (!api) throw new Error(PLAYER_UNAVAILABLE);
    return playerIsPlaying() ? api.pause() : api.resume();
}

function playerNext() {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.next === "function") {
        return Spicetify.Player.next();
    }
    const api = getPlayerOrigin();
    if (!api?.skipToNext) throw new Error(PLAYER_UNAVAILABLE);
    return api.skipToNext();
}

function playerBack() {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.back === "function") {
        return Spicetify.Player.back();
    }
    const api = getPlayerOrigin();
    if (!api?.skipToPrevious) throw new Error(PLAYER_UNAVAILABLE);
    return api.skipToPrevious();
}

function playerSetVolume(value) {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.setVolume === "function") {
        return Spicetify.Player.setVolume(value);
    }
    const playback = Spicetify?.Platform?.PlaybackAPI;
    if (!playback?.setVolume) throw new Error(PLAYER_UNAVAILABLE);
    return playback.setVolume(value);
}

function playerSeek(position) {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.seek === "function") {
        return Spicetify.Player.seek(position);
    }
    const api = getPlayerOrigin();
    if (!api?.seekTo) throw new Error(PLAYER_UNAVAILABLE);
    return api.seekTo(position);
}

function playerPlayUri(uri, context, options) {
    if (Spicetify?.Player?.origin && typeof Spicetify.Player.playUri === "function") {
        return Spicetify.Player.playUri(uri, context, options);
    }
    const api = getPlayerOrigin();
    if (!api?.play) throw new Error(PLAYER_UNAVAILABLE);
    return api.play({ uri }, context || {}, options || {});
}

function playerGetProgress() {
    try {
        if (Spicetify?.Player?.origin && typeof Spicetify.Player.getProgress === "function") {
            return Spicetify.Player.getProgress() || 0;
        }
    } catch {
        /* fall through */
    }
    const state = getPlayerOrigin()?._state;
    if (!state) return 0;
    return (state.isPaused ? 0 : Date.now() - state.timestamp) + (state.positionAsOfTimestamp || 0);
}

function playerGetDuration() {
    try {
        if (Spicetify?.Player?.origin && typeof Spicetify.Player.getDuration === "function") {
            return Spicetify.Player.getDuration() || 0;
        }
    } catch {
        /* fall through */
    }
    return getPlayerOrigin()?._state?.duration || 0;
}

function isSpotuiTypingSurface(target) {
    if (!target || target === document.body || target === document.documentElement) return false;
    if (target.id === "spotui-input" || target.id === "popup-input") return true;
    if (target.closest?.("#spotui-popup, #spotui-panes, #spotui-lyrics")) return true;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

let spotuiTypingUntil = 0;
let nowPlayingTypingTimer = null;

function markSpotuiTyping() {
    spotuiTypingUntil = performance.now() + 500;
}

function isSpotuiTypingHot() {
    return performance.now() < spotuiTypingUntil;
}

function shouldStealTypingFocus() {
    if (!document.body) return false;
    if (document.body.classList.contains("spotui-tui-hidden")) return false;
    if (document.body.classList.contains("spotui-spotify-enabled")) return false;
    if (document.body.classList.contains("spotui-search-mode")) return false;
    if (popup || paneMode) return false;
    return true;
}

function bindSpotuiFocusGuards(box, input) {
    box.addEventListener("mousedown", (e) => {
        if (isSpotuiTypingSurface(e.target)) return;
        if (e.target.closest?.("button, a, [role='button']")) return;
        e.preventDefault();
        input.focus();
    });

    const shieldSpotify = (e) => {
        if (!isSpotuiTypingSurface(e.target)) return;
        markSpotuiTyping();
        e.stopPropagation();
    };
    ["keydown", "keyup", "keypress", "input", "beforeinput", "compositionstart", "compositionupdate", "compositionend"].forEach((type) => {
        box.addEventListener(type, shieldSpotify);
    });

    document.addEventListener(
        "keydown",
        (e) => {
            if (e.target === input || document.activeElement === input) {
                markSpotuiTyping();
                return;
            }
            if (!shouldStealTypingFocus()) return;
            if (isSpotuiTypingSurface(e.target)) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const printable = e.key.length === 1 || e.key === "Backspace" || e.key === "Enter";
            if (!printable && e.key !== "Tab" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            if (document.activeElement !== input) input.focus();
        },
        true
    );
}

function waitForSpotui(fn, timeoutMs = 20000) {
    const started = Date.now();
    const tick = () => {
        if (document.body && (playerIsReady() || Spicetify?.Platform)) {
            fn();
            return;
        }
        if (Date.now() - started >= timeoutMs) {
            fn();
            return;
        }
        setTimeout(tick, 120);
    };
    tick();
}

async function execute(cmd) {
    const rawCmd = cmd.trim();
    const cleanedCmd = rawCmd.startsWith("/") || rawCmd.startsWith(".") ? rawCmd.slice(1).trim() : rawCmd;
    const [command, ...args] = cleanedCmd.split(/\s+/);
    const argText = args.join(" ").trim();
    const playbackCommands = new Set([
        "play", "pause", "p", "skip", "back", "volume", "v",
        "shuffle", "loop", "superloop", "seek",
    ]);
    if (playbackCommands.has(command) && !playerIsReady()) {
        print(PLAYER_UNAVAILABLE, "error");
        return;
    }

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
    if (command === "update") {
        await handleUpdateCommand(args[0]);
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
            const wasPlaying = playerIsPlaying();
            if (!wasPlaying) {
                playerTogglePlay();
            }
            print("Playing");
        } catch (err) {
            print("Play error: " + err.message, "error");
        }
        return;
    }

    if (command === "pause") {
        try {
            const wasPlaying = playerIsPlaying();
            if (wasPlaying) {
                playerTogglePlay();
            }
            print("Paused");
        } catch (err) {
            print("Pause error: " + err.message, "error");
        }
        return;
    }

    if (command === "p") {
        try {
            const wasPlaying = playerIsPlaying();
            playerTogglePlay();
            print(wasPlaying ? "Paused" : "Playing");
        } catch (err) {
            print("Play/pause error: " + err.message, "error");
        }
        return;
    }

    if (command === "search" || command === "s") {
        const parsed = parseSearchArgs(argText);
        if (parsed.filter && !parsed.query) {
            print(`Usage: s ${parsed.filter} <terms>`, "error");
            return;
        }
        if (parsed.query) {
            await openSearchPopup(parsed.query, parsed.scope);
            return;
        }
        document.body.classList.add("spotui-search-mode");
        document.body.classList.add("spotui-tui-hidden");
        startBackButtonDock();
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

    if (command === "share") {
        await handleShareCommand(argText);
        return;
    }

    if (command === "like") {
        await handleLibraryLike(true, { toggle: false });
        return;
    }

    if (command === "unlike") {
        await handleLibraryLike(false, { toggle: false });
        return;
    }

    if (command === "seek") {
        handleSeekCommand(argText);
        return;
    }

    if (command === "lyrics") {
        handleLyricsCommand(args.join(" "));
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

    if (command === "bar") {
        handlePlayerBarCommand(argText);
        return;
    }

    if (command === "mini") {
        await handleMiniCommand(argText);
        return;
    }

    if (command === "home" || command === "recent" || command === "rec" || command === "top") {
        await openHomePanes(command === "home" ? "" : command);
        return;
    }

    if (command === "skip") {
        try {
            playerNext();
            print("Skipped to next track");
        } catch (err) {
            print("Skip error: " + err.message, "error");
        }
        return;
    }
    if (command === "back") {
        try {
            playerBack();
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
            playerSetVolume(percent / 100);
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
            ["search | s <terms>", "search mix, albums, tracks (no terms opens Spotify search)", "search", "s"],
            ["s album <terms>", "search albums only"],
            ["s artist <terms>", "search artists only"],
            ["s mix <terms>", "search mix only"],
            ["s tracks <terms>", "search tracks only"],
            ["add <terms>", "queue the top search result"],
            ["playlist", "browse your playlists"],
            ["list", "tracks of the playing playlist"],
            ["queue", "current queue"],
            ["like | unlike", "like track / album / playlist (selection or now playing)", "like", "unlike"],
            ["np | info", "show what is playing (also on the fixed bar)", "np", "info"],
            ["share [album|track]", "copy a Spotify link (album/track now playing, or selection)", "share"],
            ["home | recent | rec | top", "Made for you (Daily Mix, Discover Weekly…) + Recents", "home", "recent", "rec", "top"],
            ["lyrics [on|off]", "open synced lyrics panel (Esc closes)", "lyrics"],
        ],
    },
    {
        id: "interface",
        label: "Interface",
        entries: [
            ["theme [name|auto|custom|set ...]", "switch or customize colors; no name opens the picker", "theme"],
            ["bg <url|off>", "image behind the logo screen; bg opacity <0-100>"],
            ["bar [on|off]", "show or hide Spotify's bottom player bar"],
            ["mini [on|off]", "open floating SpoTUI miniplayer window with GIF"],
            ["tui -m [command|cli]", "switch interface mode"],
            ["update [dismiss]", "check for SpoTUI updates or dismiss the notice", "update"],
            ["clear", "clear the log"],
            ["help [category|command]", "this list"],
        ],
    },
];

function helpEntryNames(entry) {
    const [usage, , ...aliases] = entry;
    return aliases.length ? aliases : [usage.split(/[\s<[|]/)[0]];
}

// Tab completion for the command line. Cycles matches; lists them on the status line.
let autocompleteSession = null;

function getCommandNames() {
    const names = new Set();
    for (const category of HELP_CATEGORIES) {
        for (const entry of category.entries) {
            for (const name of helpEntryNames(entry)) {
                names.add(name);
            }
        }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
}

function filterCompletions(candidates, partial) {
    const needle = partial.toLowerCase();
    return candidates.filter((item) => item.toLowerCase().startsWith(needle));
}

function longestCommonPrefix(items) {
    if (!items.length) return "";
    let prefix = items[0].toLowerCase();
    for (let i = 1; i < items.length; i += 1) {
        const value = items[i].toLowerCase();
        while (prefix && !value.startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
        }
        if (!prefix) return "";
    }
    // Prefer the casing of the first match that still shares this prefix.
    const sample = items.find((item) => item.toLowerCase().startsWith(prefix)) || items[0];
    return sample.slice(0, prefix.length);
}

function parseCompletionInput(raw) {
    let sigil = "";
    let rest = raw;
    if (rest.startsWith("/") || rest.startsWith(".")) {
        sigil = rest[0];
        rest = rest.slice(1);
    }

    const trailingSpace = /\s$/.test(rest);
    const trimmedStart = rest.replace(/^\s+/, "");
    const leading = rest.slice(0, rest.length - trimmedStart.length);

    if (!trimmedStart) {
        return { sigil, leading, kind: "command", command: null, args: [], partial: "" };
    }

    const parts = trimmedStart.split(/\s+/);
    if (trailingSpace) {
        return {
            sigil,
            leading,
            kind: "arg",
            command: parts[0].toLowerCase(),
            args: parts.slice(1),
            partial: "",
        };
    }

    if (parts.length === 1) {
        return {
            sigil,
            leading,
            kind: "command",
            command: null,
            args: [],
            partial: parts[0],
        };
    }

    return {
        sigil,
        leading,
        kind: "arg",
        command: parts[0].toLowerCase(),
        args: parts.slice(1, -1),
        partial: parts[parts.length - 1],
    };
}

function completionStub(parsed) {
    if (parsed.kind === "command") {
        return parsed.sigil + parsed.leading;
    }
    const head = [parsed.command, ...parsed.args].join(" ");
    return parsed.sigil + parsed.leading + head + " ";
}

function getArgCompletions(command, args, partial) {
    switch (command) {
        case "theme": {
            if (args.length === 0) {
                const schemes = getAllSchemes().map((scheme) => scheme.id);
                return filterCompletions(
                    [...schemes, "auto", "reset", "custom", "edit", "set", "show", "get"],
                    partial
                );
            }
            if (args[0]?.toLowerCase() === "set" && args.length === 1) {
                return filterCompletions(SCHEME_COLOR_TOKENS, partial);
            }
            return [];
        }
        case "help": {
            if (args.length === 0) {
                const categories = HELP_CATEGORIES.map((category) => category.id);
                return filterCompletions([...categories, ...getCommandNames()], partial);
            }
            return [];
        }
        case "update":
            return args.length === 0 ? filterCompletions(["dismiss"], partial) : [];
        case "loop":
        case "superloop":
        case "lyrics":
        case "bar":
        case "mini":
            return args.length === 0 ? filterCompletions(["on", "off"], partial) : [];
        case "sleep":
            return args.length === 0 ? filterCompletions(["off"], partial) : [];
        case "bg":
            return args.length === 0
                ? filterCompletions(["off", "clear", "none", "opacity", "o"], partial)
                : [];
        case "share":
            return args.length === 0 ? filterCompletions(["album", "track"], partial) : [];
        case "search":
        case "s":
            return args.length === 0
                ? filterCompletions(["album", "artist", "mix", "tracks"], partial)
                : [];
        case "tui":
            if (args.length === 0) return filterCompletions(["-m"], partial);
            if (args[0] === "-m" && args.length === 1) {
                return filterCompletions(["command", "cli"], partial);
            }
            return [];
        default:
            return [];
    }
}

function completionWantsSpace(parsed, match) {
    if (parsed.kind === "command") return true;
    if (
        (parsed.command === "search" || parsed.command === "s") &&
        parsed.args.length === 0 &&
        (match === "album" || match === "artist" || match === "mix" || match === "tracks")
    ) {
        return true;
    }
    if (parsed.command === "theme" && parsed.args.length === 0 && match === "set") return true;
    if (parsed.command === "tui" && parsed.args.length === 0 && match === "-m") return true;
    if (
        parsed.command === "bg" &&
        parsed.args.length === 0 &&
        (match === "opacity" || match === "o")
    ) {
        return true;
    }
    return false;
}

function formatCompletionMatches(matches, selected) {
    return matches
        .map((match, index) => (index === selected ? `[${match}]` : match))
        .join("  ");
}

function applyCompletionValue(input, value, after = "") {
    input.value = value + after;
    input.setSelectionRange(value.length, value.length);
}

function handleTabComplete(input) {
    const raw = input.value;
    if (input.selectionStart !== input.selectionEnd) return;

    const caret = input.selectionStart ?? raw.length;
    const beforeCaret = raw.slice(0, caret);
    const afterCaret = raw.slice(caret);

    if (autocompleteSession) {
        const { stub, matches, filter } = autocompleteSession;
        if (beforeCaret.startsWith(stub)) {
            const token = beforeCaret.slice(stub.length);
            if (matches.includes(token) || token === filter) {
                const currentIndex = matches.indexOf(token);
                const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % matches.length : 0;
                autocompleteSession.index = nextIndex;
                const match = matches[nextIndex];
                const space =
                    matches.length === 1 &&
                    completionWantsSpace(autocompleteSession.parsed, match)
                        ? " "
                        : "";
                applyCompletionValue(input, stub + match + space, afterCaret);
                if (matches.length > 1) {
                    setStatus(formatCompletionMatches(matches, nextIndex));
                }
                return;
            }
        }
        autocompleteSession = null;
    }

    const parsed = parseCompletionInput(beforeCaret);
    const matches =
        parsed.kind === "command"
            ? filterCompletions(getCommandNames(), parsed.partial)
            : getArgCompletions(parsed.command, parsed.args, parsed.partial);

    if (!matches.length) return;

    const stub = completionStub(parsed);

    // Empty token: list options without rewriting the input (avoids dumping "add" on bare Tab).
    if (!parsed.partial && matches.length > 1) {
        setStatus(formatCompletionMatches(matches, -1));
        autocompleteSession = null;
        return;
    }

    if (matches.length === 1) {
        const match = matches[0];
        const space = completionWantsSpace(parsed, match) ? " " : "";
        applyCompletionValue(input, stub + match + space, afterCaret);
        autocompleteSession = null;
        return;
    }

    const common = longestCommonPrefix(matches);
    if (common.length > parsed.partial.length) {
        applyCompletionValue(input, stub + common, afterCaret);
        setStatus(formatCompletionMatches(matches, -1));
        autocompleteSession = {
            stub,
            matches,
            filter: common,
            index: -1,
            parsed,
        };
        return;
    }

    autocompleteSession = {
        stub,
        matches,
        filter: parsed.partial,
        index: 0,
        parsed,
    };
    applyCompletionValue(input, stub + matches[0], afterCaret);
    setStatus(formatCompletionMatches(matches, 0));
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
let popupMode = null;
let playlists = [];
let popupSelected = 0;
let popupTracks = [];
let popupTrackSelected = 0;
let popupTrackTitle = "";
let popupTrackContext = null;
let popupSchemeSelected = 0;
let popupSchemeOriginal = null;
let popupCustomDraft = null;
let popupCustomRestoreId = null;
let popupCustomReturnToPicker = false;
let popupCustomSelected = 0;
let popupCustomEditing = false;
let popupFontSelected = 0;
let popupFontCustomEditing = false;
let popupHelpSelected = 0;
let popupHelpCategory = null;
let lastPlaylistContextUri = null;
let paneMode = null;
let paneFocus = "left";
let paneRightLoaded = false;
let paneRightLoading = false;
let paneDrilledDown = false;
let paneLeftItems = [];
let paneSearchQuery = "";
let paneSearchRootItems = [];
let paneSearchRootSelected = 0;
let paneSearchArtists = [];
let paneSearchTracks = [];
let paneSearchScope = "all";
let paneSearchEnrichSeq = 0;
let paneSearchEnrichTimer = null;
let panesBound = false;
let paneLoadSeq = 0;
let panePreviewTimer = null;
const albumTracksCache = new Map();
const ALBUM_TRACKS_CACHE_MAX = 80;

function clearSearchCaches() {
    albumTracksCache.clear();
    paneSearchEnrichSeq += 1;
    paneLoadSeq += 1;
    clearTimeout(paneSearchEnrichTimer);
    paneSearchEnrichTimer = null;
    clearTimeout(panePreviewTimer);
    panePreviewTimer = null;
}

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
    const schemes = getAllSchemes();
    const current = schemes.findIndex((scheme) => scheme.id === activeSchemeId);
    popupSchemeSelected = Math.max(current, 0);
    popupMode = "themes";
    renderPopup();
}

function openCustomThemePopup({ seed = null, returnToPicker = false } = {}) {
    const schemes = getAllSchemes();
    const selected = schemes[popupSchemeSelected] || null;
    const seedScheme = seed || selected || readCustomScheme();

    popupCustomReturnToPicker = returnToPicker;
    popupCustomRestoreId = returnToPicker ? popupSchemeOriginal : activeSchemeId;
    popupCustomDraft = cloneScheme(seedScheme);
    popupCustomSelected = 0;
    popupCustomEditing = false;
    popupMode = "theme-custom";
    previewSchemeColors(popupCustomDraft);
    renderPopup();
}

function openThemeFontPopup() {
    const currentFont = normalizeFontName(popupCustomDraft?.font);
    const current = SPOTUI_FONTS.findIndex(
        (font) => font.toLowerCase() === currentFont.toLowerCase()
    );
    popupFontSelected = current >= 0 ? current : SPOTUI_FONTS.length;
    popupFontCustomEditing = false;
    popupMode = "theme-fonts";
    renderPopup();
}

let pendingUpdate = null;
let updateCheckPromise = null;
let updateSessionQuiet = false;

function parseVersionParts(version) {
    return String(version || "")
        .trim()
        .replace(/^v/i, "")
        .split(/[.+-]/)
        .map((part) => {
            const num = Number(part);
            return Number.isFinite(num) ? num : part;
        });
}

function compareVersions(a, b) {
    const left = parseVersionParts(a);
    const right = parseVersionParts(b);
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i += 1) {
        const l = left[i] ?? 0;
        const r = right[i] ?? 0;
        if (l === r) continue;
        if (typeof l === "number" && typeof r === "number") return l - r;
        return String(l).localeCompare(String(r));
    }
    return 0;
}

async function fetchRemoteVersionInfo() {
    const response = await fetch(`${SPOTUI_VERSION_URL}?t=${Date.now()}`, {
        cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const version = String(data?.version || "").trim().replace(/^v/i, "");
    if (!version) throw new Error("Missing version");
    return {
        version,
        notes: String(data?.notes || "").trim() || "Bug fixes and improvements",
    };
}

async function checkForUpdates({ force = false } = {}) {
    if (!force && updateCheckPromise) return updateCheckPromise;
    updateCheckPromise = (async () => {
        const remote = await fetchRemoteVersionInfo();
        if (compareVersions(remote.version, SPOTUI_VERSION) > 0) {
            pendingUpdate = remote;
        } else {
            pendingUpdate = null;
        }
        return pendingUpdate;
    })();
    try {
        return await updateCheckPromise;
    } finally {
        updateCheckPromise = null;
    }
}

function notifyUpdateAvailable(info) {
    const summary = `SpoTUI ${info.version} available — ${info.notes}`;
    print(summary);
    try {
        if (typeof Spicetify?.showNotification === "function") {
            Spicetify.showNotification(`SpoTUI ${info.version} available — type update`);
        }
    } catch {
        /* ignore */
    }
}

function openUpdatePopup(info = pendingUpdate) {
    if (!info) {
        print("SpoTUI is up to date");
        return;
    }
    pendingUpdate = info;
    popupMode = "update";
    renderPopup();
}

async function applySpotuiUpdate(info = pendingUpdate) {
    if (!info?.version) {
        print("No update available", "error");
        return;
    }
    storeActiveVersion(info.version);
    storeDismissedVersion("");
    injectRemoteUserCss(info.version);
    print(`Updating to SpoTUI ${info.version}…`);
    try {
        if (typeof Spicetify?.showNotification === "function") {
            Spicetify.showNotification(`Updated to SpoTUI ${info.version}`);
        }
    } catch {
        /* ignore */
    }
    closePopup();
    setTimeout(() => location.reload(), 250);
}

function dismissPendingUpdate(info = pendingUpdate) {
    if (!info?.version) {
        print("No update notice to dismiss");
        return;
    }
    storeDismissedVersion(info.version);
    updateSessionQuiet = true;
    closePopup();
    print(`Dismissed update notice for ${info.version}`);
}

async function handleUpdateCommand(arg) {
    const action = (arg || "").toLowerCase();
    if (action === "dismiss") {
        try {
            const info = pendingUpdate || (await checkForUpdates({ force: true }));
            dismissPendingUpdate(info);
        } catch (err) {
            print("Update check failed: " + err.message, "error");
        }
        return;
    }

    try {
        const info = await checkForUpdates({ force: true });
        if (!info) {
            print(`SpoTUI ${SPOTUI_VERSION} is up to date`);
            return;
        }
        openUpdatePopup(info);
    } catch (err) {
        print("Update check failed: " + err.message, "error");
    }
}

async function bootUpdateCheck() {
    try {
        const info = await checkForUpdates();
        if (!info) return;
        if (readDismissedVersion() === info.version) return;
        if (updateSessionQuiet) return;
        notifyUpdateAvailable(info);
        openUpdatePopup(info);
    } catch (err) {
        console.warn("SpoTUI update check failed:", err);
    }
}

function setCustomTokenColor(token, colorValue, { persist = false, activate = false } = {}) {
    if (!SCHEME_COLOR_TOKENS.includes(token)) return null;
    const parsed = parseColor(colorValue);
    if (!parsed) return null;

    const next = persist || activate ? readCustomScheme() : cloneScheme(popupCustomDraft || readCustomScheme());
    next[token] = rgbToHex(parsed);

    if (persist) storeCustomScheme(next);
    if (activate) {
        storeCustomScheme(next);
        applyScheme(CUSTOM_SCHEME_ID);
        storeScheme(CUSTOM_SCHEME_ID);
    } else {
        popupCustomDraft = next;
        previewSchemeColors(next);
    }

    return next;
}

function getTrackTitle(track, index = 0) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    return track?.name || track?.title || meta.title || meta.name || `Track ${index + 1}`;
}

function getTrackArtist(track) {
    const meta = track?.metadata || track?.contextTrack?.metadata || {};
    if (track?.artist) return track.artist;
    if (Array.isArray(track?.artists) && track.artists.length) {
        return track.artists
            .map((artist) => artist?.profile?.name || artist?.name)
            .filter(Boolean)
            .join(", ");
    }
    if (Array.isArray(track?.artists?.items) && track.artists.items.length) {
        return track.artists.items
            .map((artist) => artist?.profile?.name || artist?.name)
            .filter(Boolean)
            .join(", ");
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

function coercePlayableTrack(entry, index = 0) {
    if (!entry || typeof entry !== "object") return null;
    const nested =
        entry.track ||
        entry.item?.data ||
        entry.item?.track ||
        entry.item ||
        entry.data ||
        entry.contextTrack ||
        entry;
    if (!nested || typeof nested !== "object") return null;
    const uri =
        nested.uri ||
        entry.uri ||
        (nested.id ? `spotify:track:${nested.id}` : "") ||
        (entry.id ? `spotify:track:${entry.id}` : "");
    if (!uri || !String(uri).includes(":track:")) return null;
    const playable =
        nested.isPlayable ?? nested.is_playable ?? entry.isPlayable ?? entry.is_playable;
    if (playable === false) return null;
    const normalized = normalizeTrackItem({ ...nested, ...entry, uri }, index);
    return normalized.uri ? normalized : null;
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

function getSearchVariables(query, limit) {
    return {
        searchTerm: query,
        query,
        offset: 0,
        limit,
        numberOfTopResults: Math.min(limit, 50),
        includeAudiobooks: false,
        includeArtistHasConcertsField: false,
        includeLocalConcertsField: false,
        includePreReleases: false,
        includeAlbumPreReleases: false,
        includeAuthors: false,
        includeEpisodeContentRatingsV2: false,
        isPrefix: false,
        sectionFilters: [],
    };
}

function emptySearchCatalog() {
    return { artists: [], albums: [], tracks: [], playlists: [] };
}

function catalogHitCount(catalog) {
    if (!catalog) return 0;
    return (
        (catalog.artists?.length || 0) +
        (catalog.albums?.length || 0) +
        (catalog.tracks?.length || 0) +
        (catalog.playlists?.length || 0)
    );
}

function trimSearchCatalog(catalog) {
    return {
        artists: (catalog?.artists || []).slice(0, SEARCH_ARTIST_LIMIT),
        albums: (catalog?.albums || []).slice(0, SEARCH_ALBUM_LIMIT),
        tracks: (catalog?.tracks || []).slice(0, SEARCH_TRACK_LIMIT),
        playlists: (catalog?.playlists || []).slice(0, SEARCH_MIX_LIMIT),
    };
}

function unwrapSearchNode(entry) {
    if (!entry) return null;
    const data =
        entry?.item?.data ||
        entry?.item ||
        entry?.data ||
        entry?.track ||
        entry?.album ||
        entry?.artist ||
        entry?.playlist ||
        entry?.playlistV2 ||
        entry?.contextTrack ||
        entry?.node?.data ||
        entry?.node ||
        entry;
    if (!data || typeof data !== "object") return null;
    return data;
}

function searchHitType(data, hint) {
    if (hint === "track" || hint === "album" || hint === "artist" || hint === "playlist") {
        return hint;
    }
    const uri = String(data?.uri || data?.data?.uri || "");
    const typename = String(data?.__typename || data?.type || "");
    if (uri.includes(":track:") || /^track$/i.test(typename)) return "track";
    if (uri.includes(":album:") || /album/i.test(typename)) return "album";
    if (uri.includes(":artist:") || /artist/i.test(typename)) return "artist";
    if (uri.includes(":playlist:") || /playlist/i.test(typename)) return "playlist";
    return homeCardTypeFromUri(uri);
}

function searchArtistNames(data) {
    const groups = [
        data?.artists?.items,
        data?.artists,
        data?.artist?.items,
        data?.data?.artists?.items,
        data?.data?.artists,
    ];
    for (const group of groups) {
        if (!Array.isArray(group) || !group.length) continue;
        const names = group
            .map((artist) => artist?.profile?.name || artist?.name)
            .filter(Boolean);
        if (names.length) return names.join(", ");
    }
    return getTrackArtist(data);
}

function normalizeSearchHit(raw, typeHint, index = 0) {
    const data = unwrapSearchNode(raw);
    if (!data) return null;
    const uri = data.uri || data.data?.uri || "";
    if (!uri) return null;
    const type = searchHitType(data, typeHint);
    if (type !== "track" && type !== "album" && type !== "artist" && type !== "playlist") {
        return null;
    }

    const name =
        data.name ||
        data.profile?.name ||
        data.data?.name ||
        data.data?.profile?.name ||
        getTrackTitle(data, index);
    const owner =
        data.owner?.display_name ||
        data.owner?.name ||
        data.data?.owner?.display_name ||
        "";
    const artist =
        type === "artist" ? "" : type === "playlist" ? owner || searchArtistNames(data) : searchArtistNames(data);

    return {
        kind: "card",
        type,
        id: `${type}:${uri}`,
        name: String(name || type),
        subtitle: String(artist || ""),
        uri: String(uri),
        artist: artist || "",
        section: type,
    };
}

function dedupeSearchHits(hits) {
    const seen = new Set();
    const out = [];
    for (const hit of hits) {
        if (!hit?.uri || seen.has(hit.uri)) continue;
        seen.add(hit.uri);
        out.push(hit);
    }
    return out;
}

function mergeSearchCatalogs(...catalogs) {
    const merged = emptySearchCatalog();
    for (const catalog of catalogs) {
        if (!catalog) continue;
        merged.artists.push(...(catalog.artists || []));
        merged.albums.push(...(catalog.albums || []));
        merged.tracks.push(...(catalog.tracks || []));
        merged.playlists.push(...(catalog.playlists || []));
    }
    return {
        artists: dedupeSearchHits(merged.artists),
        albums: dedupeSearchHits(merged.albums),
        tracks: dedupeSearchHits(merged.tracks),
        playlists: dedupeSearchHits(merged.playlists),
    };
}

function collectSearchBucketItems(bucket) {
    if (!bucket) return [];
    if (Array.isArray(bucket)) return bucket;
    return bucket.items || bucket.itemsV2 || bucket.edges || [];
}

function takeSearchHits(bucket, typeHint, limit) {
    const hits = [];
    for (const entry of collectSearchBucketItems(bucket)) {
        const hit = normalizeSearchHit(entry?.node || entry, typeHint, hits.length);
        if (hit && (!typeHint || hit.type === typeHint)) hits.push(hit);
        if (hits.length >= limit) break;
    }
    return dedupeSearchHits(hits);
}

function extractSearchCatalogFromPayload(payload) {
    const catalog = emptySearchCatalog();
    if (!payload) return catalog;

    if (Array.isArray(payload)) {
        for (const entry of payload) {
            const hit = normalizeSearchHit(entry, "track", catalog.tracks.length);
            if (hit?.type === "track") catalog.tracks.push(hit);
        }
        return trimSearchCatalog({ ...catalog, tracks: dedupeSearchHits(catalog.tracks) });
    }

    const root = payload.data || payload;
    const search = root.searchV2 || root.search || root;

    catalog.tracks = takeSearchHits(
        search?.tracksV2 || search?.tracks || root?.tracksV2 || root?.tracks,
        "track",
        SEARCH_TRACK_LIMIT
    );
    catalog.albums = takeSearchHits(
        search?.albumsV2 || search?.albums || root?.albumsV2 || root?.albums,
        "album",
        SEARCH_ALBUM_LIMIT
    );
    catalog.artists = takeSearchHits(
        search?.artistsV2 || search?.artists || root?.artistsV2 || root?.artists,
        "artist",
        SEARCH_ARTIST_LIMIT
    );
    catalog.playlists = takeSearchHits(
        search?.playlistsV2 || search?.playlists || root?.playlistsV2 || root?.playlists,
        "playlist",
        SEARCH_MIX_LIMIT
    );

    const topHits = takeSearchHits(
        search?.topResultsV2 || search?.topResults || root?.topResultsV2 || root?.topResults,
        null,
        SEARCH_TRACK_LIMIT + SEARCH_ALBUM_LIMIT + SEARCH_ARTIST_LIMIT + SEARCH_MIX_LIMIT
    );
    for (const hit of topHits) {
        if (hit.type === "track") catalog.tracks.push(hit);
        else if (hit.type === "album") catalog.albums.push(hit);
        else if (hit.type === "artist") catalog.artists.push(hit);
        else if (hit.type === "playlist") catalog.playlists.push(hit);
    }

    return trimSearchCatalog({
        artists: dedupeSearchHits(catalog.artists),
        albums: dedupeSearchHits(catalog.albums),
        tracks: dedupeSearchHits(catalog.tracks),
        playlists: dedupeSearchHits(catalog.playlists),
    });
}

function normalizeSearchTrack(track, index = 0) {
    const hit = normalizeSearchHit(track, "track", index);
    if (hit) {
        return { uri: hit.uri, name: hit.name, artist: hit.artist };
    }
    const base = normalizeTrackItem(track, index);
    if (base.artist) return base;
    return { ...base, artist: searchArtistNames(track) };
}

function catalogToTracks(catalog) {
    return (catalog?.tracks || []).map((hit, index) => ({
        uri: hit.uri,
        name: hit.name,
        artist: hit.artist || hit.subtitle || "",
        index,
    }));
}

// Search route modules register GraphQL defs lazily; a silent visit primes them.
async function ensureSearchDefinitions(timeoutMs = 2500) {
    const defs = Spicetify.GraphQL?.Definitions;
    if (!defs) return false;
    if (defs.searchTracks || defs.searchDesktop || defs.searchModalResults) return true;

    const history = Spicetify.Platform?.History;
    if (!history?.push) return false;

    const previous = history.location
        ? {
            pathname: history.location.pathname,
            search: history.location.search || "",
            hash: history.location.hash || "",
            state: history.location.state,
        }
        : null;

    try {
        history.push("/search");
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
            if (defs.searchTracks || defs.searchDesktop || defs.searchModalResults) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    } catch (err) {
        console.warn("SpoTUI could not prime search definitions:", err);
    } finally {
        try {
            if (previous) history.replace(previous);
            else if (history.goBack) history.goBack();
        } catch {
            // Leave the user on search rather than throwing out of the command.
        }
    }

    return Boolean(defs.searchTracks || defs.searchDesktop || defs.searchModalResults);
}

async function searchViaGraphQL(query, limit) {
    const request = Spicetify.GraphQL?.Request;
    const defs = Spicetify.GraphQL?.Definitions;
    if (!request || !defs) return null;

    await ensureSearchDefinitions();

    const variables = getSearchVariables(query, limit);
    const candidates = ["searchDesktop", "searchModalResults", "searchTracks"];
    let lastError = null;
    let best = emptySearchCatalog();

    for (const name of candidates) {
        const definition = defs[name];
        if (!definition) continue;
        try {
            const res = await request(definition, variables);
            if (res?.errors?.length) {
                lastError = new Error(res.errors[0]?.message || `${name} GraphQL error`);
                continue;
            }
            best = mergeSearchCatalogs(best, extractSearchCatalogFromPayload(res));
        } catch (err) {
            lastError = err;
            console.warn(`SpoTUI GraphQL ${name} failed:`, err);
        }
    }

    if (catalogHitCount(best)) return best;
    if (lastError) throw lastError;
    return null;
}

function catalogFromWebSearchBody(body) {
    if (!body) return emptySearchCatalog();
    const mapItems = (items, type, limit) =>
        dedupeSearchHits(
            coerceList(items)
                .map((item, index) => normalizeSearchHit(item, type, index))
                .filter(Boolean)
        ).slice(0, limit);
    return trimSearchCatalog({
        artists: mapItems(body.artists?.items, "artist", SEARCH_ARTIST_LIMIT),
        albums: mapItems(body.albums?.items, "album", SEARCH_ALBUM_LIMIT),
        tracks: mapItems(body.tracks?.items, "track", SEARCH_TRACK_LIMIT),
        playlists: mapItems(body.playlists?.items, "playlist", SEARCH_MIX_LIMIT),
    });
}

function searchTypesForScope(scope) {
    if (scope === "album") return "album,artist";
    if (scope === "artist") return "artist";
    if (scope === "mix") return "playlist,artist";
    if (scope === "track") return "track";
    return "album,artist,playlist,track";
}

async function searchViaWebApi(query, limit = SEARCH_TRACK_LIMIT, scope = "all") {
    const page = Math.min(Math.max(limit, SEARCH_ALBUM_LIMIT), 50);
    const url =
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}` +
        `&type=${searchTypesForScope(scope)}&limit=${page}`;
    const body = await spotifyWebApiRequest("GET", url);
    if (!body?.tracks && !body?.albums && !body?.artists && !body?.playlists) return null;
    return catalogFromWebSearchBody(body);
}

async function searchCatalog(query, limit = SEARCH_TRACK_LIMIT, scope = "all") {
    const errors = [];

    try {
        const webCatalog = await searchViaWebApi(query, limit, scope);
        if (webCatalog && catalogHitCount(webCatalog)) return trimSearchCatalog(webCatalog);
    } catch (err) {
        errors.push(err);
    }

    try {
        const graphqlCatalog = await searchViaGraphQL(query, limit);
        if (graphqlCatalog && catalogHitCount(graphqlCatalog)) {
            return trimSearchCatalog(graphqlCatalog);
        }
    } catch (err) {
        errors.push(err);
    }

    const detail = errors.map((err) => err?.message || String(err)).filter(Boolean).join("; ");
    throw new Error(detail || "No working search backend available");
}

async function searchTracks(query, limit = SEARCH_RESULT_LIMIT) {
    const catalog = await searchCatalog(query, Math.max(limit, SEARCH_TRACK_LIMIT));
    return catalogToTracks(catalog).slice(0, limit);
}

function withSearchSectionHeaders(mix, albums, tracks, artists) {
    const rows = [];
    const push = (title, items, section) => {
        if (!items?.length) return;
        rows.push({
            kind: "header",
            id: `header:${section}`,
            name: title,
            uri: null,
            section,
        });
        rows.push(...items);
    };
    push("Artists", artists, "artist");
    push("Mix", mix, "mix");
    push("Albums", albums, "album");
    push("Tracks", tracks, "track");
    return rows;
}

function parseSearchArgs(argText) {
    const raw = String(argText || "").trim();
    if (!raw) return { scope: "all", query: "", filter: "" };
    const match = raw.match(
        /^(albums?|álbum|álbuns|albuns?|artists?|artistas?|mixes?|tracks?|musicas?|músicas?)\b(?:\s+(.*))?$/i
    );
    if (!match) return { scope: "all", query: raw, filter: "" };
    const kind = match[1]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const query = String(match[2] || "").trim();
    if (/^albums?$|^albuns?$/.test(kind)) return { scope: "album", query, filter: "album" };
    if (/^artists?$|^artistas?$/.test(kind)) return { scope: "artist", query, filter: "artist" };
    if (/^mixes?$/.test(kind)) return { scope: "mix", query, filter: "mix" };
    return { scope: "track", query, filter: "tracks" };
}

function searchScopeLabel(scope) {
    if (scope === "album") return "albums";
    if (scope === "artist") return "artists";
    if (scope === "mix") return "mix";
    if (scope === "track") return "tracks";
    return "search";
}

async function openSearchPopup(query, scope = "all") {
    clearSearchCaches();
    paneSearchScope = scope || "all";
    print(`Searching ${searchScopeLabel(paneSearchScope)} "${query}"...`);
    try {
        const catalog = await searchCatalog(query, SEARCH_TRACK_LIMIT, paneSearchScope);
        const artists = paneSearchScope === "artist" ? catalog.artists || [] : [];
        const mix =
            paneSearchScope === "album" ||
            paneSearchScope === "track" ||
            paneSearchScope === "artist"
                ? []
                : (catalog.playlists || []).map((item) => ({ ...item, section: "mix" }));
        const albums =
            paneSearchScope === "mix" ||
            paneSearchScope === "track" ||
            paneSearchScope === "artist"
                ? []
                : catalog.albums || [];
        const tracks =
            paneSearchScope === "album" ||
            paneSearchScope === "mix" ||
            paneSearchScope === "artist"
                ? []
                : catalog.tracks || [];
        const rows = withSearchSectionHeaders(mix, albums, tracks, artists);
        if (!rows.length && !catalog.artists?.length) {
            print(`No results for "${query}".`, "error");
            return;
        }
        paneSearchQuery = query;
        paneSearchRootItems = [];
        paneSearchRootSelected = 0;
        paneSearchArtists = catalog.artists.slice();
        paneSearchTracks = tracks.slice();
        paneLeftItems = rows.length
            ? rows
            : withSearchSectionHeaders([], [], [], []);
        popupSelected = firstSelectableHomeIndex(paneLeftItems);
        popupTracks = [];
        popupTrackTitle = "";
        popupTrackContext = null;
        popupTrackSelected = 0;
        paneRightLoaded = false;
        paneRightLoading = false;
        paneDrilledDown = false;
        openPanes("search", "left");
        scheduleSearchPreview();
        const artist = catalog.artists[0];
        if (artist?.uri && paneSearchScope !== "track" && paneSearchScope !== "artist") {
            scheduleArtistShelves(artist);
        }
        const total =
            (artists.length || 0) + (mix.length || 0) + (albums.length || 0) + (tracks.length || 0);
        if (!total && artist?.uri) {
            print(`Loading ${searchScopeLabel(paneSearchScope)} for "${query}"...`);
        } else {
            print(`${total} result${total === 1 ? "" : "s"} for "${query}"`);
        }
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

function assertWebApiPayload(res, label = "Web API") {
    if (res == null) throw new Error(`${label}: empty response`);
    if (res.error) {
        const err = res.error;
        throw new Error(err.message || String(err.status || `${label} failed`));
    }
    if (typeof res.status === "number" && res.status >= 400) {
        throw new Error(res.message || `${label} HTTP ${res.status}`);
    }
    return res;
}

function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}

function firstResolved(promises) {
    return new Promise((resolve, reject) => {
        const errors = [];
        let pending = promises.length;
        if (!pending) {
            reject(new Error("No request attempts"));
            return;
        }
        for (const promise of promises) {
            Promise.resolve(promise).then(
                resolve,
                (err) => {
                    errors.push(err);
                    pending -= 1;
                    if (!pending) reject(errors[0] || err);
                }
            );
        }
    });
}

function payloadHasItems(res) {
    if (res == null) return false;
    if (Array.isArray(res)) return res.length > 0;
    if (typeof res !== "object") return false;
    if (Array.isArray(res.tracks) && res.tracks.length) return true;
    if (Array.isArray(res.items) && res.items.length) return true;
    if (res.tracks?.items?.length) return true;
    if (res.albums?.items?.length) return true;
    if (res.artists?.items?.length) return true;
    return false;
}

function firstUsefulResult(promises) {
    return new Promise((resolve, reject) => {
        const errors = [];
        let pending = promises.length;
        let fallback;
        let hasFallback = false;
        let settled = false;
        if (!pending) {
            reject(new Error("No request attempts"));
            return;
        }
        const finish = (fn, value) => {
            if (settled) return;
            settled = true;
            fn(value);
        };
        for (const promise of promises) {
            Promise.resolve(promise).then(
                (value) => {
                    pending -= 1;
                    if (payloadHasItems(value)) {
                        finish(resolve, value);
                        return;
                    }
                    if (!hasFallback) {
                        fallback = value;
                        hasFallback = true;
                    }
                    if (!pending) finish(resolve, hasFallback ? fallback : value);
                },
                (err) => {
                    errors.push(err);
                    pending -= 1;
                    if (!pending) {
                        if (hasFallback) finish(resolve, fallback);
                        else finish(reject, errors[0] || err);
                    }
                }
            );
        }
    });
}

function rememberAlbumTracks(uri, items) {
    if (!uri || !items?.length) return items || [];
    if (albumTracksCache.size >= ALBUM_TRACKS_CACHE_MAX) {
        const oldest = albumTracksCache.keys().next().value;
        albumTracksCache.delete(oldest);
    }
    albumTracksCache.set(uri, items);
    return items;
}

async function spotifyWebApiFetch(method, url, body) {
    const token = Spicetify.Platform?.Session?.accessToken;
    if (!token) throw new Error("No Spotify session token available");
    const res = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const errBody = await res.json();
            detail = errBody?.error?.message || detail;
        } catch {
            /* ignore */
        }
        throw new Error(detail);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function spotifyWebApiRequest(method, path, body) {
    const url = path.startsWith("http") ? path : `https://api.spotify.com/v1${path}`;
    const verb = method.toLowerCase();
    const attempts = [];

    attempts.push(withTimeout(spotifyWebApiFetch(method, url, body), 5000, "fetch"));

    if (Spicetify.CosmosAsync?.[verb]) {
        const pending =
            body === undefined
                ? Spicetify.CosmosAsync[verb](url)
                : Spicetify.CosmosAsync[verb](url, body);
        attempts.push(withTimeout(pending, 8000, "CosmosAsync"));
    }

    const res = await firstUsefulResult(attempts);
    return res == null ? null : assertWebApiPayload(res, "Web API");
}

const MADE_FOR_YOU_CATEGORY_ID = "0JQ5DAt0tbjZptfcdMSKl3";
const MADE_FOR_YOU_VIEWS = [
    "made-for-x-hub",
    "made-for-x-dailymix",
    "made-for-x-discovery",
    "made-for-x",
];
const MADE_FOR_YOU_SECTION_URIS = [
    "spotify:section:0JQ5DAqAJXkJGsa2DyEjKi", // Made for you
    "spotify:section:0JQ5DAUnp4wcj0bCb3wh3S", // Daily mixes
];
const MADE_FOR_YOU_PAGE_URIS = [
    `spotify:page:${MADE_FOR_YOU_CATEGORY_ID}`,
    "spotify:page:made-for-x-hub",
    "spotify:genre:0JQ5DAt0tbjZptfcdMSKl3",
];
const MADE_FOR_YOU_SECTION_HINT =
    /feito para|made for|daily mix|descobertas|discover weekly|on repeat|repeat rewind|your dj|\bdj\b|radar|daylist|mix/i;
const RECENT_SECTION_HINT = /recent|recente|jump back|voltar|ouvido|last played/i;
const MADE_FOR_YOU_CARD_HINT =
    /daily mix|descobertas|discover weekly|on repeat|repeat rewind|release radar|daylist|your dj|\bdj\b|mix$/i;

function getSpotifyMarket() {
    const country =
        Spicetify.Platform?.Session?.country ||
        Spicetify.Platform?.session?.country ||
        "";
    if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
    const loc = String(Spicetify.Locale?.getLocale?.() || Spicetify.Locale?._locale || "");
    const matched = loc.match(/-([A-Za-z]{2})$/);
    if (matched) return matched[1].toUpperCase();
    return "";
}

function marketQuery() {
    const market = getSpotifyMarket();
    return market ? `&market=${encodeURIComponent(market)}` : "";
}

function getCookieValue(name) {
    try {
        const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : "";
    } catch {
        return "";
    }
}

function getHomeTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

function coerceList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.tracks)) return value.tracks;
    if (Array.isArray(value.playHistories)) return value.playHistories;
    return [];
}

function homeCardTypeFromUri(uri) {
    const value = String(uri || "");
    if (value.includes(":playlist:")) return "playlist";
    if (value.includes(":album:")) return "album";
    if (value.includes(":collection") || value.includes(":your-episodes")) return "collection";
    if (value.includes(":artist:")) return "artist";
    if (value.includes(":show:") || value.includes(":episode:")) return "show";
    return "other";
}

function normalizeHomeCard(raw, section = "made") {
    if (!raw) return null;
    if (raw.kind === "header") return raw;

    const uri =
        raw.uri ||
        raw.data?.uri ||
        raw.content?.data?.uri ||
        raw.playlist?.uri ||
        raw.album?.uri ||
        "";
    if (!uri || String(uri).includes(":track:") || String(uri).includes(":section:")) return null;

    const type = raw.type || homeCardTypeFromUri(uri);
    if (type === "artist" || type === "show" || type === "other") return null;

    const name =
        raw.name ||
        raw.data?.name ||
        raw.content?.data?.name ||
        raw.playlist?.name ||
        raw.album?.name ||
        raw.title?.text ||
        "Untitled";
    const subtitle =
        raw.subtitle ||
        raw.description ||
        raw.data?.description ||
        raw.content?.data?.description ||
        "";

    return {
        kind: "card",
        id: `${section}:${uri}`,
        name: String(name),
        subtitle: String(subtitle || ""),
        uri: String(uri),
        type,
        section,
    };
}

function dedupeHomeCards(cards) {
    const seen = new Set();
    const out = [];
    for (const card of cards) {
        if (!card?.uri || seen.has(card.uri)) continue;
        seen.add(card.uri);
        out.push(card);
    }
    return out;
}

function extractCardsFromUnknownPayload(payload, section = "made") {
    const out = [];
    const visit = (node, depth = 0) => {
        if (!node || depth > 8) return;
        if (Array.isArray(node)) {
            node.forEach((item) => visit(item, depth + 1));
            return;
        }
        if (typeof node !== "object") return;

        const uri = node.uri || node.data?.uri || node.content?.data?.uri;
        const typename = node.__typename || node.data?.__typename || node.content?.data?.__typename;
        const looksLikeCard =
            uri &&
            (typename === "Playlist" ||
                typename === "Album" ||
                String(uri).includes(":playlist:") ||
                String(uri).includes(":album:") ||
                String(uri).includes(":collection"));

        if (looksLikeCard) {
            const card = normalizeHomeCard(node.content?.data || node.data || node, section);
            if (card) out.push(card);
        }

        for (const value of Object.values(node)) {
            if (value && typeof value === "object") visit(value, depth + 1);
        }
    };
    visit(payload);
    return dedupeHomeCards(out);
}

function sectionTitleText(section) {
    return (
        section?.data?.title?.text ||
        section?.title?.text ||
        section?.title ||
        section?.data?.title ||
        section?.name ||
        ""
    );
}

function parseHomeGraphSections(payload) {
    const root = payload?.data || payload;
    const sections =
        root?.home?.sectionContainer?.sections?.items ||
        root?.home?.sectionContainer?.sections ||
        root?.homeSections?.sections ||
        [];
    return coerceList(sections);
}

function cardsFromHomeSection(section, forcedSection = "") {
    const title = String(sectionTitleText(section) || "");
    const typename = String(section?.data?.__typename || section?.__typename || "");
    let sectionId = forcedSection;
    if (!sectionId) {
        if (
            RECENT_SECTION_HINT.test(title) ||
            /RecentlyPlayed/i.test(typename)
        ) {
            sectionId = "recent";
        } else if (
            MADE_FOR_YOU_SECTION_HINT.test(title) ||
            /YourDJ|MadeFor|DailyMix|Discovery/i.test(typename)
        ) {
            sectionId = "made";
        } else {
            sectionId = "other";
        }
    }

    const items = coerceList(
        section?.sectionItems?.items || section?.sectionItems || section?.items
    );
    const cards = [];
    for (const item of items) {
        const raw =
            item?.content?.data ||
            item?.data ||
            item?.content ||
            item?.playlist ||
            item?.album ||
            item;
        const card = normalizeHomeCard(raw, sectionId);
        if (card) cards.push(card);
    }
    return { title, sectionId, cards: dedupeHomeCards(cards) };
}

async function ensureHomeDefinitions(timeoutMs = 1800) {
    const defs = Spicetify.GraphQL?.Definitions;
    if (!defs) return false;

    const history = Spicetify.Platform?.History;
    // Always nudge the home route once so home GraphQL modules finish registering.
    if (!history?.push) return Boolean(defs.home || defs.homeSection);

    const previous = history.location
        ? {
            pathname: history.location.pathname,
            search: history.location.search || "",
            hash: history.location.hash || "",
            state: history.location.state,
        }
        : null;
    const alreadyHome = previous?.pathname === "/" || previous?.pathname === "";

    if (alreadyHome && (defs.home || defs.homeSection)) {
        return true;
    }

    try {
        if (!alreadyHome) history.push("/");
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
            if (defs.home || defs.homeSection) break;
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        // Give the home query client a brief moment after navigation.
        await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (err) {
        console.warn("SpoTUI could not prime home definitions:", err);
    } finally {
        try {
            if (!alreadyHome) {
                if (previous) history.replace(previous);
                else if (history.goBack) history.goBack();
            }
        } catch {
            /* ignore */
        }
    }

    return Boolean(defs.home || defs.homeSection);
}

function getHomeGraphVariables(extra = {}) {
    // Matches the desktop client's home query variables (see xpui home modules).
    return {
        homeEndUserIntegration: "INTEGRATION_DESKTOP",
        timeZone: getHomeTimeZone(),
        sp_t: getCookieValue("sp_t") || "",
        facet: "",
        sectionItemsLimit: 20,
        includeEpisodeContentRatingsV2: false,
        ...extra,
    };
}

function graphDefinitionHash(definition) {
    if (!definition) return "";
    return (
        definition.hash ||
        definition.sha256Hash ||
        definition.id ||
        definition[2] ||
        ""
    );
}

async function pathfinderQuery(operationName, variables, hash) {
    if (!operationName || !hash) return null;
    const params = new URLSearchParams({
        operationName,
        variables: JSON.stringify(variables),
        extensions: JSON.stringify({
            persistedQuery: { version: 1, sha256Hash: hash },
        }),
    });
    const url = `https://api-partner.spotify.com/pathfinder/v1/query?${params}`;
    const errors = [];

    if (Spicetify.CosmosAsync?.get) {
        try {
            const res = await Spicetify.CosmosAsync.get(url);
            if (res?.errors?.length) {
                throw new Error(res.errors[0]?.message || "pathfinder error");
            }
            return res;
        } catch (err) {
            errors.push(err);
        }
    }

    const token = Spicetify.Platform?.Session?.accessToken;
    if (!token) {
        if (errors.length) throw errors[0];
        return null;
    }

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "App-Platform": "Win32",
        },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(body?.errors?.[0]?.message || `pathfinder HTTP ${res.status}`);
    }
    if (body?.errors?.length) {
        throw new Error(body.errors[0]?.message || "pathfinder error");
    }
    return body;
}

async function requestHomeGraph(definitionName, variables) {
    const request = Spicetify.GraphQL?.Request;
    const defs = Spicetify.GraphQL?.Definitions;
    if (!defs?.[definitionName]) return null;

    const errors = [];
    if (request) {
        try {
            const res = await request(defs[definitionName], variables);
            if (res?.errors?.length) {
                throw new Error(res.errors[0]?.message || `${definitionName} GraphQL error`);
            }
            return res;
        } catch (err) {
            errors.push(err);
            console.warn(`SpoTUI GraphQL ${definitionName} failed:`, err);
        }
    }

    try {
        const hash = graphDefinitionHash(defs[definitionName]);
        const res = await pathfinderQuery(definitionName, variables, hash);
        if (res) return res;
    } catch (err) {
        errors.push(err);
        console.warn(`SpoTUI pathfinder ${definitionName} failed:`, err);
    }

    if (errors.length) throw errors[0];
    return null;
}

async function fetchHomeFeedViaGraphQL() {
    await ensureHomeDefinitions();
    // Try a few variable shapes — Spotify has changed these across clients.
    const attempts = [
        getHomeGraphVariables(),
        getHomeGraphVariables({ facet: null }),
        {
            timeZone: getHomeTimeZone(),
            sp_t: getCookieValue("sp_t") || "",
            country: getSpotifyMarket(),
            facet: null,
            sectionItemsLimit: 10,
        },
    ];

    let lastError = null;
    for (const variables of attempts) {
        try {
            const res = await requestHomeGraph("home", variables);
            const sections = parseHomeGraphSections(res);
            if (sections.length) return sections;
            // Some payloads nest differently; still try to extract cards later.
            if (res?.data?.home || res?.data?.homeSections) return parseHomeGraphSections(res);
        } catch (err) {
            lastError = err;
        }
    }
    if (lastError) throw lastError;
    return [];
}

async function fetchHomeSectionCards(sectionUri, section = "made") {
    await ensureHomeDefinitions();
    const variables = getHomeGraphVariables({
        uri: sectionUri,
        sectionItemsOffset: 0,
        sectionItemsLimit: 40,
    });
    const res = await requestHomeGraph("homeSection", variables);
    const sections = parseHomeGraphSections(res);
    const cards = [];
    for (const entry of sections) {
        cards.push(...cardsFromHomeSection(entry, section).cards);
    }
    if (cards.length) return dedupeHomeCards(cards);
    return extractCardsFromUnknownPayload(res, section);
}

async function fetchViewCards(viewId) {
    const market = getSpotifyMarket();
    const params = new URLSearchParams({
        limit: "20",
        content_limit: "20",
        types: "album,playlist,artist,show,station,episode",
        image_style: "gradient_overlay",
        include_external: "audio",
        timestamp: new Date().toISOString(),
        market,
        country: market,
    });
    const res = await spotifyWebApiRequest("GET", `/views/${encodeURIComponent(viewId)}?${params}`);
    return extractCardsFromUnknownPayload(res, "made");
}

async function fetchMadeForYouFromCategory() {
    const res = await spotifyWebApiRequest(
        "GET",
        `/browse/categories/${encodeURIComponent(MADE_FOR_YOU_CATEGORY_ID)}/playlists?limit=50`
    );
    return dedupeHomeCards(
        coerceList(res?.playlists?.items || res?.items)
            .map((item) => normalizeHomeCard(item, "made"))
            .filter(Boolean)
    );
}

async function fetchMadeForYouFromSearch() {
    const queries = [
        "Daily Mix",
        "Discover Weekly",
        "Descobertas da Semana",
        "On Repeat",
        "Release Radar",
        "Radar de Novidades",
    ];
    const out = [];
    for (const query of queries) {
        try {
            const res = await spotifyWebApiRequest(
                "GET",
                `/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`
            );
            for (const item of coerceList(res?.playlists?.items)) {
                const name = String(item?.name || "");
                const owner = String(item?.owner?.display_name || item?.owner?.id || "");
                const uri = String(item?.uri || "");
                const editorial =
                    uri.includes("playlist:37i9d") ||
                    /spotify/i.test(owner) ||
                    MADE_FOR_YOU_CARD_HINT.test(name);
                if (!editorial || !MADE_FOR_YOU_CARD_HINT.test(name)) continue;
                const card = normalizeHomeCard(item, "made");
                if (card) out.push(card);
            }
        } catch (err) {
            console.warn(`SpoTUI made-for-you search (${query}) failed:`, err);
        }
    }
    return dedupeHomeCards(out);
}

async function fetchMadeForYouFromBrowsePage() {
    const request = Spicetify.GraphQL?.Request;
    const defs = Spicetify.GraphQL?.Definitions;
    if (!request || !defs) return [];

    const definition = defs.browsePage || defs.browseSectionContainer || defs.browseAll;
    if (!definition) return [];

    for (const uri of MADE_FOR_YOU_PAGE_URIS) {
        try {
            const res = await request(definition, {
                uri,
                page: null,
                offset: 0,
                limit: 50,
                sectionOffset: 0,
                sectionLimit: 20,
            });
            if (res?.errors?.length) continue;
            const cards = extractCardsFromUnknownPayload(res, "made");
            if (cards.length) return cards;
        } catch (err) {
            console.warn(`SpoTUI browsePage ${uri} failed:`, err);
        }
    }
    return [];
}

function classifyHomeCard(card, sectionTitle = "", sectionTypename = "") {
    if (!card) return null;
    const name = String(card.name || "");
    if (
        RECENT_SECTION_HINT.test(sectionTitle) ||
        /RecentlyPlayed/i.test(sectionTypename)
    ) {
        return { ...card, section: "recent" };
    }
    if (
        MADE_FOR_YOU_SECTION_HINT.test(sectionTitle) ||
        MADE_FOR_YOU_CARD_HINT.test(name) ||
        /YourDJ|MadeFor|DailyMix|Discovery/i.test(sectionTypename)
    ) {
        return { ...card, section: "made" };
    }
    // Default playlists/albums from the home feed into Made for you-ish shelf.
    if (card.type === "playlist" || card.type === "album" || card.type === "collection") {
        return { ...card, section: "made" };
    }
    return null;
}

function splitHomeFeedSections(sections) {
    const made = [];
    const recent = [];
    for (const section of sections) {
        const title = String(sectionTitleText(section) || "");
        const typename = String(section?.data?.__typename || section?.__typename || "");
        const parsed = cardsFromHomeSection(section, "other");
        for (const card of parsed.cards) {
            const classified = classifyHomeCard(card, title, typename);
            if (!classified) continue;
            if (classified.section === "recent") recent.push(classified);
            else made.push(classified);
        }
    }

    // If title matching failed entirely, keep every playable card as made-for-you.
    if (!made.length && !recent.length) {
        for (const section of sections) {
            const parsed = cardsFromHomeSection(section, "made");
            made.push(...parsed.cards);
        }
    }

    return {
        made: dedupeHomeCards(made),
        recent: dedupeHomeCards(recent),
    };
}

async function fetchMadeForYouFallbackCards() {
    const errors = [];

    for (const sectionUri of MADE_FOR_YOU_SECTION_URIS) {
        try {
            const cards = await fetchHomeSectionCards(sectionUri, "made");
            if (cards.length) return cards;
        } catch (err) {
            errors.push(err);
            console.warn(`SpoTUI homeSection ${sectionUri} failed:`, err);
        }
    }

    try {
        const cards = await fetchMadeForYouFromBrowsePage();
        if (cards.length) return cards;
    } catch (err) {
        errors.push(err);
    }

    for (const viewId of MADE_FOR_YOU_VIEWS) {
        try {
            const cards = await fetchViewCards(viewId);
            if (cards.length) return cards;
        } catch (err) {
            errors.push(err);
            console.warn(`SpoTUI view ${viewId} failed:`, err);
        }
    }

    try {
        const cards = await fetchMadeForYouFromCategory();
        if (cards.length) return cards;
    } catch (err) {
        errors.push(err);
        console.warn("SpoTUI made-for-you category failed:", err);
    }

    try {
        const cards = await fetchMadeForYouFromSearch();
        if (cards.length) return cards;
    } catch (err) {
        errors.push(err);
    }

    if (errors.length) throw errors[0];
    return [];
}

async function fetchRecentContextFallbackCards(limit = 30) {
    const errors = [];
    const endpoints = [
        `/me/player/recently-played?limit=${Math.min(limit, 50)}`,
        `https://spclient.wg.spotify.com/recently-played/v1/list?format=json&limit=${limit}`,
        `https://spclient.wg.spotify.com/recently-played/desktop/v1/list?format=json&limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await spotifyWebApiRequest("GET", endpoint);
            const rows = coerceList(res?.items || res?.play_contexts || res);
            const cards = [];
            for (const row of rows) {
                const context = row?.context || row?.play_context || row?.data?.context;
                const track = row?.track || row?.data?.track || row?.item;
                const contextUri = context?.uri || row?.contextUri;
                if (contextUri) {
                    const type = homeCardTypeFromUri(contextUri);
                    if (type === "playlist" || type === "album" || type === "collection") {
                        const name =
                            context?.name ||
                            row?.name ||
                            track?.album?.name ||
                            (type === "collection" ? "Liked Songs" : null) ||
                            contextUri.split(":").pop();
                        const card = normalizeHomeCard(
                            { uri: contextUri, name, type, subtitle: type },
                            "recent"
                        );
                        if (card) cards.push(card);
                        continue;
                    }
                }

                // No context: fall back to the album of the played track.
                const album = track?.album;
                if (album?.uri || album?.id) {
                    const card = normalizeHomeCard(
                        {
                            uri: album.uri || `spotify:album:${album.id}`,
                            name: album.name || "Album",
                            type: "album",
                        },
                        "recent"
                    );
                    if (card) cards.push(card);
                }
            }
            if (cards.length) return dedupeHomeCards(cards).slice(0, limit);
        } catch (err) {
            errors.push(err);
        }
    }

    if (errors.length) console.warn("SpoTUI recent contexts failed:", errors[0]);
    return [];
}

function extractAlbumTracksGraphql(payload) {
    const root = payload?.data || payload;
    const album = root?.albumUnion || root?.album || root;
    const items = album?.tracksV2?.items || album?.tracks?.items || [];
    return coerceList(items)
        .map((entry) => entry?.track || entry?.item?.data || entry?.item || entry?.data || entry)
        .filter((track) => track?.uri && String(track.uri).includes(":track:"));
}

async function fetchAlbumTracksWeb(albumUri) {
    const id = String(albumUri || "").split(":").pop();
    if (!id) return [];
    const res = await spotifyWebApiRequest(
        "GET",
        `/albums/${encodeURIComponent(id)}/tracks?limit=50${marketQuery()}`
    );
    return coerceList(res?.items).map((track, index) => ({
        ...track,
        uri: track.uri || (track.id ? `spotify:track:${track.id}` : ""),
        album: track.album || { name: "" },
        index,
    }));
}

async function fetchAlbumItems(albumUri) {
    const cached = albumTracksCache.get(albumUri);
    if (cached?.length) return cached;

    try {
        const webItems = await fetchAlbumTracksWeb(albumUri);
        if (webItems.length) return rememberAlbumTracks(albumUri, webItems);
    } catch (err) {
        console.warn("SpoTUI album web tracks failed:", err);
    }

    const request = Spicetify.GraphQL?.Request;
    const defs = Spicetify.GraphQL?.Definitions;
    if (request && defs?.queryAlbumTracks) {
        try {
            const res = await withTimeout(
                request(defs.queryAlbumTracks, { uri: albumUri, offset: 0, limit: 100 }),
                4000,
                "queryAlbumTracks"
            );
            if (!res?.errors?.length) {
                const tracks = extractAlbumTracksGraphql(res);
                if (tracks.length) return rememberAlbumTracks(albumUri, tracks);
            }
        } catch (err) {
            console.warn("SpoTUI queryAlbumTracks failed:", err);
        }
    }

    if (Spicetify.Platform?.AlbumAPI?.getTracks) {
        try {
            const res = await withTimeout(
                Spicetify.Platform.AlbumAPI.getTracks(albumUri),
                2500,
                "AlbumAPI"
            );
            const items = coerceList(res?.items || res);
            if (items.length) return rememberAlbumTracks(albumUri, items);
        } catch (err) {
            console.warn("SpoTUI AlbumAPI.getTracks failed:", err);
        }
    }

    return [];
}

async function graphqlTry(names, variables, timeoutMs = 4000) {
    const request = Spicetify.GraphQL?.Request;
    const defs = Spicetify.GraphQL?.Definitions;
    if (!request || !defs) return null;
    for (const name of names) {
        const definition = defs[name];
        if (!definition) continue;
        try {
            const res = await withTimeout(request(definition, variables), timeoutMs, name);
            if (!res?.errors?.length) return res;
        } catch (err) {
            console.warn(`SpoTUI GraphQL ${name} failed:`, err);
        }
    }
    return null;
}

function extractArtistTopTracksGraphql(payload) {
    const root = payload?.data || payload;
    const artist = root?.artistUnion || root?.artist || root;
    const buckets = [
        artist?.discography?.topTracks?.items,
        artist?.topTracks?.items,
        artist?.tracks?.items,
        artist?.discography?.popularReleasesAlbums?.items,
    ];
    const out = [];
    for (const bucket of buckets) {
        for (const entry of coerceList(bucket)) {
            const track = coercePlayableTrack(
                entry?.track || entry?.item?.data || entry?.item || entry?.data || entry
            );
            if (track) out.push(track);
        }
        if (out.length) break;
    }
    return dedupeTracks(out);
}

function mapArtistAlbumHits(rawItems, section = "album") {
    return dedupeArtistAlbumItems(rawItems)
        .map((album, index) => {
            const hit = normalizeSearchHit(album, "album", index);
            return hit ? { ...hit, section } : null;
        })
        .filter(Boolean);
}

function asMixHit(raw, index, typeHint) {
    const data = unwrapSearchNode(raw);
    const uri = String(data?.uri || data?.data?.uri || "");
    const hint = uri.includes(":playlist:")
        ? "playlist"
        : uri.includes(":album:")
          ? "album"
          : typeHint;
    const hit = normalizeSearchHit(raw, hint, index);
    return hit ? { ...hit, section: "mix" } : null;
}

function extractArtistAlbumsGraphql(payload) {
    const root = payload?.data || payload;
    const artist = root?.artistUnion || root?.artist || root;
    const discog = artist?.discography || artist;
    const raw = [];
    const buckets = [
        discog?.albums?.items,
        discog?.singles?.items,
        discog?.compilations?.items,
        discog?.all?.items,
    ];
    for (const bucket of buckets) {
        for (const entry of coerceList(bucket)) {
            const release =
                entry?.releases?.items?.[0] ||
                entry?.album ||
                entry?.item?.data ||
                entry?.item ||
                entry;
            if (release) raw.push(release);
        }
    }
    return mapArtistAlbumHits(raw);
}

function extractArtistMixGraphql(payload) {
    const root = payload?.data || payload;
    const artist = root?.artistUnion || root?.artist || root;
    const related = artist?.relatedContent || artist;
    const playlists = [];

    const takePlaylists = (bucket) => {
        for (const entry of coerceList(bucket)) {
            const hit = asMixHit(entry, playlists.length, "playlist");
            if (hit) playlists.push(hit);
        }
    };
    takePlaylists(related?.featuring?.items);
    takePlaylists(related?.discoveredOn?.items);
    takePlaylists(related?.playlists?.items);

    return dedupeSearchHits(playlists);
}

function searchResultTracksForArtist(name) {
    const needle = String(name || "").toLowerCase();
    if (!needle) return [];
    const rows = paneSearchRootItems.length ? paneSearchRootItems : paneLeftItems;
    return rows.filter((row) => {
        if (row?.type !== "track" || !row.uri) return false;
        const hay = `${row.artist || ""} ${row.subtitle || ""} ${row.name || ""}`.toLowerCase();
        return hay.includes(needle);
    });
}

async function fetchTracksByArtistSearch(artistName) {
    if (!artistName) return [];
    try {
        const catalog = await searchViaWebApi(`artist:"${artistName}"`, SEARCH_TRACK_LIMIT);
        const needle = String(artistName).toLowerCase();
        return (catalog?.tracks || []).filter((track) =>
            String(track.artist || track.subtitle || "").toLowerCase().includes(needle)
        );
    } catch (err) {
        console.warn("SpoTUI artist search fallback failed:", err);
        return [];
    }
}

async function fetchArtistAlbumsPage(artistId, offset = 0, groups = "album,single,compilation") {
    const res = await spotifyWebApiRequest(
        "GET",
        `/artists/${encodeURIComponent(artistId)}/albums` +
            `?include_groups=${encodeURIComponent(groups)}` +
            `&limit=${ARTIST_ALBUMS_PAGE}&offset=${offset}${marketQuery()}`
    );
    const items = coerceList(res?.items);
    return {
        items,
        next: Boolean(res?.next) && items.length >= ARTIST_ALBUMS_PAGE,
    };
}

async function fetchArtistTopTracks(artistUri, artistName = "") {
    const id = String(artistUri || "").split(":").pop();
    if (!id) return [];
    const market = getSpotifyMarket() || "US";

    try {
        const res = await spotifyWebApiRequest(
            "GET",
            `/artists/${encodeURIComponent(id)}/top-tracks?market=${encodeURIComponent(market)}`
        );
        const tracks = coerceList(res?.tracks)
            .map((track, index) => coercePlayableTrack(track, index))
            .filter(Boolean);
        if (tracks.length) return tracks;
    } catch (err) {
        console.warn("SpoTUI artist top-tracks failed:", err);
    }

    for (const name of ["queryArtistOverview", "queryArtist", "queryArtistDiscographyTopTracks"]) {
        try {
            const gql = await graphqlTry([name], { uri: artistUri, locale: "", includePrerelease: false }, 2500);
            const tracks = extractArtistTopTracksGraphql(gql);
            if (tracks.length) return tracks;
        } catch (err) {
            console.warn(`SpoTUI artist GraphQL ${name} failed:`, err);
        }
    }

    const api = Spicetify.Platform?.ArtistAPI;
    if (api) {
        for (const method of ["getTopTracks", "getTracks", "getContents"]) {
            if (typeof api[method] !== "function") continue;
            try {
                const res = await withTimeout(api[method](artistUri), 2500, `ArtistAPI.${method}`);
                const tracks = coerceList(res?.items || res?.tracks || res)
                    .map((entry, index) => coercePlayableTrack(entry, index))
                    .filter(Boolean);
                if (tracks.length) return tracks;
            } catch (err) {
                console.warn(`SpoTUI ArtistAPI.${method} failed:`, err);
            }
        }
    }

    const local = searchResultTracksForArtist(artistName);
    if (local.length) return local;

    return fetchTracksByArtistSearch(artistName);
}

function albumGroupRank(item) {
    const group = String(item?.album_group || item?.album_type || "").toLowerCase();
    if (group === "album") return 0;
    if (group === "compilation") return 1;
    if (group === "single") return 2;
    return 3;
}

function dedupeArtistAlbumItems(rawItems) {
    const byUri = new Map();
    for (const item of rawItems) {
        const uri = item?.uri || (item?.id ? `spotify:album:${item.id}` : "");
        if (!uri || byUri.has(uri)) continue;
        byUri.set(uri, item);
    }

    return [...byUri.values()].sort((a, b) => {
        const rank = albumGroupRank(a) - albumGroupRank(b);
        if (rank) return rank;
        return String(b.release_date || "").localeCompare(String(a.release_date || ""));
    });
}

async function fetchArtistAppearsOn(artistId) {
    const raw = [];
    let offset = 0;
    while (offset < ARTIST_APPEARS_MAX) {
        const page = await fetchArtistAlbumsPage(artistId, offset, "appears_on");
        raw.push(...page.items);
        if (!page.next) break;
        offset += ARTIST_ALBUMS_PAGE;
    }
    return mapArtistAlbumHits(raw, "mix");
}

async function fetchArtistMixPlaylistsBySearch(artistName) {
    if (!artistName) return [];
    try {
        const res = await spotifyWebApiRequest(
            "GET",
            `/search?q=${encodeURIComponent(artistName)}&type=playlist&limit=20`
        );
        const needle = String(artistName).toLowerCase();
        return coerceList(res?.playlists?.items)
            .map((item, index) => asMixHit(item, index, "playlist"))
            .filter(Boolean)
            .filter((hit) => {
                const hay = `${hit.name} ${hit.subtitle || ""}`.toLowerCase();
                return hay.includes(needle) || /\bmix\b|this is|radio|aparece|feat/i.test(hay);
            });
    } catch (err) {
        console.warn("SpoTUI artist mix search failed:", err);
        return [];
    }
}

async function fetchArtistMixGraphql(artistUri) {
    for (const name of ["queryArtistOverview", "queryArtistRelatedContent", "queryArtist"]) {
        try {
            const gql = await graphqlTry([name], { uri: artistUri, locale: "", includePrerelease: false }, 2500);
            const hits = extractArtistMixGraphql(gql);
            if (hits.length) return hits;
        } catch (err) {
            console.warn(`SpoTUI artist mix GraphQL ${name} failed:`, err);
        }
    }
    return [];
}

async function fetchArtistMix(artistUri, artistName = "") {
    const id = String(artistUri || "").split(":").pop();
    if (!id) return [];
    const [gqlHits, searched] = await Promise.all([
        fetchArtistMixGraphql(artistUri),
        fetchArtistMixPlaylistsBySearch(artistName),
    ]);
    const playlists = [...gqlHits, ...searched].filter((hit) => hit.type === "playlist");
    return dedupeSearchHits(playlists).slice(0, SEARCH_MIX_LIMIT);
}

async function collectArtistAlbums(artistUri, onPage) {
    const id = String(artistUri || "").split(":").pop();
    if (!id) return [];
    const seq = paneSearchEnrichSeq;
    const stillCurrent = () => seq === paneSearchEnrichSeq;
    const raw = [];

    try {
        let offset = 0;
        while (offset < ARTIST_ALBUMS_MAX) {
            if (!stillCurrent()) return mapArtistAlbumHits(raw);
            const page = await fetchArtistAlbumsPage(id, offset);
            if (!stillCurrent()) return mapArtistAlbumHits(raw);
            raw.push(...page.items);
            const albums = mapArtistAlbumHits(raw);
            onPage?.(albums);
            if (!page.next) return albums;
            offset += ARTIST_ALBUMS_PAGE;
        }
        return mapArtistAlbumHits(raw);
    } catch (err) {
        console.warn("SpoTUI artist albums web failed:", err);
    }

    try {
        const collected = [];
        let offset = 0;
        while (offset < ARTIST_ALBUMS_MAX) {
            if (!stillCurrent()) return dedupeSearchHits(collected);
            const gql = await graphqlTry(
                ["queryArtistDiscographyAlbums", "queryArtistDiscographyAll", "queryArtistOverview"],
                { uri: artistUri, offset, limit: ARTIST_ALBUMS_PAGE, locale: "" }
            );
            if (!stillCurrent()) return dedupeSearchHits(collected);
            const page = extractArtistAlbumsGraphql(gql);
            if (!page.length) break;
            collected.push(...page);
            const albums = dedupeSearchHits(collected);
            onPage?.(albums);
            if (page.length < ARTIST_ALBUMS_PAGE) return albums;
            offset += ARTIST_ALBUMS_PAGE;
        }
        return dedupeSearchHits(collected);
    } catch (err) {
        console.warn("SpoTUI artist albums GraphQL failed:", err);
    }

    return [];
}

async function fetchArtistAlbums(artistUri) {
    return collectArtistAlbums(artistUri);
}

async function fetchLikedSongs(limit = 50) {
    try {
        const res = await spotifyWebApiRequest("GET", `/me/tracks?limit=${limit}`);
        return coerceList(res?.items)
            .map((entry, index) => normalizeTrackItem(entry?.track || entry, index))
            .filter((track) => track.uri?.includes(":track:"));
    } catch (err) {
        console.warn("SpoTUI liked songs web failed:", err);
    }

    const api = Spicetify.Platform?.LibraryAPI;
    if (api?.getContents) {
        const res = await api.getContents({
            filters: ["1"],
            offset: 0,
            limit,
            order: "addedAt",
            sortOrder: -1,
        });
        return coerceList(res?.items || res)
            .map((item, index) => normalizeTrackItem(item, index))
            .filter((track) => track.uri?.includes(":track:"));
    }
    return [];
}

async function fetchHomeItemTracks(item) {
    if (!item?.uri) return [];
    if (item.type === "playlist" || Spicetify.URI?.isPlaylistV1OrV2?.(item.uri)) {
        return fetchPlaylistItems(item.uri);
    }
    if (item.type === "album" || String(item.uri).includes(":album:")) {
        return fetchAlbumItems(item.uri);
    }
    if (item.type === "collection" || String(item.uri).includes(":collection")) {
        return fetchLikedSongs(50);
    }
    // Last resort: try playlist API, then album.
    try {
        return await fetchPlaylistItems(item.uri);
    } catch {
        return fetchAlbumItems(item.uri);
    }
}

function withHomeSectionHeaders(madeCards, recentCards) {
    const rows = [];
    if (madeCards.length) {
        rows.push({
            kind: "header",
            id: "header:made",
            name: "Made for you",
            uri: null,
            section: "made",
        });
        rows.push(...madeCards);
    }
    if (recentCards.length) {
        rows.push({
            kind: "header",
            id: "header:recent",
            name: "Recents",
            uri: null,
            section: "recent",
        });
        rows.push(...recentCards);
    }
    return rows;
}

async function loadHomeCatalog() {
    let madeCards = [];
    let recentCards = [];
    let madeError = null;
    let recentError = null;
    const notes = [];

    try {
        const sections = await fetchHomeFeedViaGraphQL();
        notes.push(`graphql sections=${sections.length}`);
        const split = splitHomeFeedSections(sections);
        madeCards = split.made;
        recentCards = split.recent;
        // Also vacuum any nested playlist/album nodes the section parser missed.
        if (!madeCards.length && sections.length) {
            const vacuum = extractCardsFromUnknownPayload({ sections }, "made");
            for (const card of vacuum) {
                const classified = classifyHomeCard(card);
                if (classified?.section === "recent") recentCards.push(classified);
                else if (classified) madeCards.push(classified);
            }
        }
    } catch (err) {
        madeError = err;
        notes.push(`graphql: ${err.message}`);
        console.warn("SpoTUI home GraphQL feed failed:", err);
    }

    if (!madeCards.length) {
        try {
            madeCards = await fetchMadeForYouFallbackCards();
            notes.push(`fallback made=${madeCards.length}`);
        } catch (err) {
            madeError = err;
            notes.push(`made fallback: ${err.message}`);
            console.error("SpoTUI made-for-you error:", err);
        }
    }

    if (!recentCards.length) {
        try {
            recentCards = await fetchRecentContextFallbackCards(30);
            notes.push(`fallback recent=${recentCards.length}`);
        } catch (err) {
            recentError = err;
            notes.push(`recent fallback: ${err.message}`);
            console.error("SpoTUI recents error:", err);
        }
    }

    madeCards = dedupeHomeCards(madeCards);
    const madeUris = new Set(madeCards.map((card) => card.uri));
    recentCards = dedupeHomeCards(recentCards).filter((card) => !madeUris.has(card.uri));

    return {
        rows: withHomeSectionHeaders(madeCards, recentCards),
        madeCount: madeCards.length,
        recentCount: recentCards.length,
        madeError,
        recentError,
        notes,
    };
}

function firstSelectableHomeIndex(rows, preferSection = "") {
    if (preferSection) {
        const idx = rows.findIndex(
            (row) => row.kind !== "header" && row.section === preferSection && row.uri
        );
        if (idx >= 0) return idx;
    }
    const first = rows.findIndex((row) => row.kind !== "header" && row.uri);
    return Math.max(first, 0);
}

function formatHomeLeftLabel(item, idx) {
    if (item?.kind === "header") return item.name;
    const n = paneLeftItems.slice(0, idx + 1).filter((row) => row.kind !== "header").length;
    const hint =
        item?.section === "mix"
            ? " · mix"
            : item?.type && item.type !== "playlist"
              ? ` · ${item.type}`
              : "";
    return `${n}. ${item.name}${hint}`;
}

function beginRightPaneLoad(title, contextUri) {
    popupTrackTitle = title || "";
    popupTrackContext = contextUri ? { uri: contextUri } : null;
    popupTracks = [];
    popupTrackSelected = 0;
    paneRightLoaded = true;
    paneRightLoading = true;
}

function finishRightPaneLoad() {
    paneRightLoaded = true;
    paneRightLoading = false;
}

function applyPaneTracks(item, items) {
    popupTracks = dedupeTracks(
        (items || []).map((entry, index) => coercePlayableTrack(entry, index)).filter(Boolean)
    );
    popupTrackTitle = item.name;
    popupTrackContext = { uri: item.uri };
    if (item.type === "playlist") lastPlaylistContextUri = item.uri;
    const currentTrackUri = Spicetify.Player.data?.item?.uri;
    popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
    finishRightPaneLoad();
}

async function loadHomeItemIntoPane(item, { play = false, focusRight = true, silent = false } = {}) {
    if (!item || item.kind === "header" || !item.uri) return;
    const seq = ++paneLoadSeq;

    popupTrackTitle = item.name;
    popupTrackContext = { uri: item.uri };
    if (play || focusRight) paneDrilledDown = true;

    const cached = item.type === "album" || String(item.uri).includes(":album:")
        ? albumTracksCache.get(item.uri)
        : null;
    if (cached?.length) {
        applyPaneTracks(item, cached);
    } else {
        beginRightPaneLoad(item.name, item.uri);
    }
    renderPanes();

    if (play) {
        playerPlayUri(item.uri);
        print(`Playing: ${item.name}`);
        if (focusRight) focusPane("right");
    } else if (!silent) {
        print(`Loading ${item.name}...`);
    }

    if (cached?.length && !play) return;

    try {
        const items = await fetchHomeItemTracks(item);
        if (seq !== paneLoadSeq) return;
        applyPaneTracks(item, items);
        renderPanes();
        if (focusRight && !play) focusPane("right");
        if (!popupTracks.length && !silent) print(`No tracks in ${item.name}.`, "error");
    } catch (err) {
        if (seq !== paneLoadSeq) return;
        finishRightPaneLoad();
        if (!popupTracks.length) {
            popupTracks = [];
            renderPanes();
            if (!silent) print(`${item.name} error: ${err.message}`, "error");
        }
        console.error("SpoTUI home item error:", err);
    }
}

function scheduleHomePreview() {
    if (paneMode !== "home") return;
    clearTimeout(panePreviewTimer);
    const item = paneLeftItems[popupSelected];
    if (!item || item.kind === "header" || !item.uri) {
        popupTrackTitle = item?.name || "";
        popupTracks = [];
        popupTrackSelected = 0;
        popupTrackContext = null;
        paneRightLoaded = false;
        renderPanes();
        return;
    }

    beginRightPaneLoad(item.name, item.uri);
    renderPanes();

    panePreviewTimer = setTimeout(() => {
        loadHomeItemIntoPane(item, { play: false, focusRight: false, silent: true });
    }, 280);
}

async function loadArtistTopTracksIntoPane(item, { silent = false } = {}) {
    if (!item?.uri) return;
    const seq = ++paneLoadSeq;
    beginRightPaneLoad(item.name, item.uri);
    renderPanes();

    try {
        let tracks = await fetchArtistTopTracks(item.uri, item.name);
        if (!tracks.length) tracks = searchResultTracksForArtist(item.name);
        if (seq !== paneLoadSeq) return;
        applyPaneTracks(item, tracks);
        renderPanes();
        if (!popupTracks.length && !silent) print(`No tracks for ${item.name}.`, "error");
    } catch (err) {
        if (seq !== paneLoadSeq) return;
        finishRightPaneLoad();
        popupTracks = [];
        renderPanes();
        if (!silent) print(`${item.name} error: ${err.message}`, "error");
        console.error("SpoTUI artist tracks error:", err);
    }
}

function currentSearchTracks() {
    if (paneSearchTracks.length) return paneSearchTracks;
    return paneLeftItems.filter(
        (row) =>
            row.kind !== "header" &&
            (row.type === "track" || String(row.uri || "").includes(":track:"))
    );
}

function currentSearchAlbums() {
    return paneLeftItems.filter(
        (row) =>
            row.kind !== "header" &&
            row.section !== "mix" &&
            (row.type === "album" || String(row.uri || "").includes(":album:"))
    );
}

function applySearchCatalogRows(mix, albums, tracks, keepUri = "") {
    const rows = withSearchSectionHeaders(mix, albums, tracks);
    paneLeftItems = rows;
    if (keepUri) {
        const idx = rows.findIndex((row) => row.kind !== "header" && row.uri === keepUri);
        popupSelected = idx >= 0 ? idx : firstSelectableHomeIndex(rows);
    } else {
        popupSelected = firstSelectableHomeIndex(rows);
    }
    renderPanes();
}

function scheduleArtistShelves(item) {
    if (!item?.uri || paneMode !== "search" || paneDrilledDown) return;
    clearTimeout(paneSearchEnrichTimer);
    paneSearchEnrichTimer = setTimeout(() => {
        refreshSearchArtistShelves(item);
    }, 120);
}

async function refreshSearchArtistShelves(item) {
    if (!item?.uri || paneMode !== "search" || paneDrilledDown) return;
    if (paneSearchScope === "track" || paneSearchScope === "artist") return;
    const seq = ++paneSearchEnrichSeq;
    const wantAlbums = paneSearchScope === "all" || paneSearchScope === "album";
    const wantMix = paneSearchScope === "all" || paneSearchScope === "mix";
    let albums = wantAlbums ? currentSearchAlbums() : [];
    let mix = wantMix
        ? paneLeftItems.filter((row) => row.kind !== "header" && row.section === "mix")
        : [];
    const tracks = paneSearchScope === "all" ? currentSearchTracks() : [];
    const redraw = () => {
        if (seq !== paneSearchEnrichSeq || paneMode !== "search" || paneDrilledDown) return;
        applySearchCatalogRows(mix, albums, tracks, paneLeftItems[popupSelected]?.uri || "");
    };

    const mixPromise = wantMix
        ? fetchArtistMix(item.uri, item.name).then((hits) => {
              if (hits.length) mix = hits;
              redraw();
          })
        : Promise.resolve();

    if (wantAlbums) {
        const fetchedAlbums = await collectArtistAlbums(item.uri, (next) => {
            if (next.length) albums = next;
            redraw();
        });
        if (fetchedAlbums.length) albums = fetchedAlbums;
        redraw();
    }
    await mixPromise;
    redraw();
}

async function enterArtistDiscography(item) {
    if (!item?.uri) return;
    paneLoadSeq += 1;
    const seq = ++paneSearchEnrichSeq;
    if (!paneSearchRootItems.length) {
        paneSearchRootItems = paneLeftItems.slice();
        paneSearchRootSelected = popupSelected;
    }
    print(`Loading ${item.name}...`);
    beginRightPaneLoad(item.name, item.uri);
    renderPanes();

    const artistHeader = {
        kind: "header",
        id: `header:artist:${item.uri}`,
        name: item.name,
        uri: null,
        section: "artist",
    };
    let albums = [];
    let previewed = false;
    const applyRows = () => {
        if (seq !== paneSearchEnrichSeq) return;
        paneDrilledDown = true;
        const keepUri = paneLeftItems[popupSelected]?.uri || "";
        paneLeftItems = [artistHeader, ...albums];
        const idx = paneLeftItems.findIndex((row) => row.kind !== "header" && row.uri === keepUri);
        popupSelected = idx >= 0 ? idx : albums.length ? 1 : 0;
        renderPanes();
        focusPane("left");
        if (!previewed) {
            const first = paneLeftItems.find((row) => row.kind !== "header" && row.uri);
            if (first?.uri) {
                previewed = true;
                loadHomeItemIntoPane(first, { play: false, focusRight: true, silent: true });
            }
        }
    };

    try {
        albums = await collectArtistAlbums(item.uri, (next) => {
            if (seq !== paneSearchEnrichSeq) return;
            albums = next;
            applyRows();
        });
        if (seq !== paneSearchEnrichSeq) return;
        applyRows();
        if (!albums.length) {
            finishRightPaneLoad();
            renderPanes();
            print(`No albums for ${item.name}.`, "error");
            return;
        }
        print(`${albums.length} album${albums.length === 1 ? "" : "s"} · ${item.name}`);
    } catch (err) {
        if (seq !== paneSearchEnrichSeq) return;
        finishRightPaneLoad();
        renderPanes();
        print(`${item.name} error: ${err.message}`, "error");
        console.error("SpoTUI artist albums error:", err);
    }
}

function restoreSearchResults() {
    clearTimeout(panePreviewTimer);
    panePreviewTimer = null;
    paneLoadSeq += 1;
    paneSearchEnrichSeq += 1;
    if (paneSearchRootItems.length) {
        paneLeftItems = paneSearchRootItems;
        popupSelected = Math.min(
            paneSearchRootSelected,
            Math.max(paneLeftItems.length - 1, 0)
        );
        paneSearchRootItems = [];
        paneSearchRootSelected = 0;
    }
    paneDrilledDown = false;
    popupTracks = [];
    popupTrackSelected = 0;
    popupTrackTitle = "";
    popupTrackContext = null;
    paneRightLoaded = false;
    paneRightLoading = false;
    renderPanes();
    focusPane("left");
    scheduleSearchPreview();
}

function handleSearchPaneEscape() {
    if (paneSearchRootItems.length) {
        restoreSearchResults();
        return true;
    }
    if (paneDrilledDown) {
        clearPaneRight();
        return true;
    }
    clearSearchCaches();
    return false;
}

async function loadSearchItemIntoPane(item, { play = false, focusRight = true, silent = false } = {}) {
    if (!item || item.kind === "header" || !item.uri) return;

    if (item.type === "track" || String(item.uri).includes(":track:")) {
        const track = {
            uri: item.uri,
            name: item.name,
            artist: item.artist || item.subtitle || "",
        };
        popupTrackTitle = item.name;
        popupTracks = [track];
        popupTrackSelected = 0;
        popupTrackContext = null;
        finishRightPaneLoad();
        renderPanes();
        if (play) {
            playerPlayUri(track.uri);
            print("Playing: " + formatTrackLabel(track));
            if (focusRight) focusPane("right");
        }
        return;
    }

    if (item.type === "artist" || String(item.uri).includes(":artist:")) {
        if (play) {
            await enterArtistDiscography(item);
            return;
        }
        await loadArtistTopTracksIntoPane(item, { silent });
        return;
    }

    await loadHomeItemIntoPane(item, { play, focusRight, silent });
}

function showCachedAlbumPreview(item) {
    const cached = albumTracksCache.get(item.uri);
    popupTrackTitle = item.name;
    popupTrackContext = { uri: item.uri };
    if (cached?.length) {
        applyPaneTracks(item, cached);
    } else {
        beginRightPaneLoad(item.name, item.uri);
    }
    renderPanes();
}

function scheduleSearchPreview() {
    if (paneMode !== "search") return;
    clearTimeout(panePreviewTimer);
    const item = paneLeftItems[popupSelected];
    if (!item || item.kind === "header" || !item.uri) {
        popupTrackTitle = item?.name || "";
        popupTracks = [];
        popupTrackSelected = 0;
        popupTrackContext = null;
        paneRightLoaded = false;
        paneRightLoading = false;
        renderPanes();
        return;
    }

    if (item.type === "track" || String(item.uri).includes(":track:")) {
        loadSearchItemIntoPane(item, { play: false, focusRight: false, silent: true });
        return;
    }

    if (item.type === "artist" || String(item.uri).includes(":artist:")) {
        loadSearchItemIntoPane(item, { play: false, focusRight: false, silent: true });
        return;
    }

    if (
        item.type === "album" ||
        item.type === "playlist" ||
        String(item.uri).includes(":album:") ||
        String(item.uri).includes(":playlist:")
    ) {
        if (item.type === "album" || String(item.uri).includes(":album:")) {
            showCachedAlbumPreview(item);
            if (albumTracksCache.get(item.uri)?.length) return;
        } else {
            beginRightPaneLoad(item.name, item.uri);
            renderPanes();
        }
        panePreviewTimer = setTimeout(() => {
            loadSearchItemIntoPane(item, { play: false, focusRight: false, silent: true });
        }, 180);
        return;
    }

    beginRightPaneLoad(item.name, item.uri);
    renderPanes();

    panePreviewTimer = setTimeout(() => {
        loadSearchItemIntoPane(item, { play: false, focusRight: false, silent: true });
    }, 80);
}

async function openHomePanes(focusId = "") {
    print("Loading Made for you & Recents...");
    popupTracks = [];
    popupTrackTitle = "";
    popupTrackContext = null;
    popupTrackSelected = 0;
    paneRightLoaded = false;
    paneLeftItems = [];
    popupSelected = 0;
    openPanes("home", "left");
    renderPanes();

    try {
        const catalog = await loadHomeCatalog();
        paneLeftItems = catalog.rows;

        const prefer =
            focusId === "recent" ? "recent" : focusId === "rec" || focusId === "top" ? "made" : "made";
        popupSelected = firstSelectableHomeIndex(paneLeftItems, prefer);

        if (!paneLeftItems.length) {
            const detail =
                catalog.madeError?.message ||
                catalog.recentError?.message ||
                catalog.notes?.join(" · ") ||
                "nothing returned";
            print(`Home empty (${detail}).`, "error");
            if (catalog.notes?.length) print(catalog.notes.join(" | "), "error");
            renderPanes();
            return;
        }

        print(
            `Home: ${catalog.madeCount} made for you · ${catalog.recentCount} recents`
        );
        renderPanes();
        const selected = paneLeftItems[popupSelected];
        if (selected?.uri) {
            await loadHomeItemIntoPane(selected, { play: false, focusRight: true, silent: true });
        }
    } catch (err) {
        print(`Home error: ${err.message}`, "error");
        console.error("SpoTUI home error:", err);
        renderPanes();
    }
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
    const p = clampNumber(percent, 0, 1);
    const exact = p * width;
    const full = Math.floor(exact);
    const partials = ["", "\u258F", "\u258E", "\u258D", "\u258C", "\u258B", "\u258A", "\u2589"];
    const partialIdx = Math.min(7, Math.round((exact - full) * 8));
    const partial = full < width && partialIdx > 0 ? partials[partialIdx] : "";
    const rest = Math.max(width - full - (partial ? 1 : 0), 0);
    // Text form for cli / np dump: smooth partial block + clean dashes for the rest.
    return `[${"\u2588".repeat(full)}${partial}${"\u2500".repeat(rest)}]`;
}

function setTextIfChanged(el, text) {
    if (!el || el.textContent === text) return;
    el.textContent = text;
}

function setNowPlayingProgressEl(el, percent) {
    if (!el) return;
    const p = clampNumber(percent, 0, 1);
    if (Math.abs(p - nowPlayingLastProgress) < 0.002) return;
    nowPlayingLastProgress = p;
    let fill = nowPlayingEls?.fill;
    if (!fill || !fill.isConnected) {
        fill = el.querySelector(".spotui-np-bar-fill");
        if (!fill) {
            el.innerHTML = `<span class="spotui-np-bar-track"><span class="spotui-np-bar-fill"></span></span>`;
            fill = el.querySelector(".spotui-np-bar-fill");
        }
        if (nowPlayingEls) nowPlayingEls.fill = fill;
    }
    fill.style.transform = `scaleX(${p})`;
}

const REPEAT_LABELS = ["off", "all", "one"];
const NP_PROGRESS_WIDTH = 28;

let nowPlayingEls = null;
let nowPlayingBound = false;
let nowPlayingRaf = null;
let nowPlayingLastTrackUri = "";
let nowPlayingLastProgress = -1;
let nowPlayingLastClock = "";
let nowPlayingLastPaint = 0;

function getNowPlayingEls() {
    if (nowPlayingEls?.root?.isConnected) return nowPlayingEls;
    const root = document.getElementById("spotui-nowplaying");
    if (!root) return null;
    nowPlayingEls = {
        root,
        state: root.querySelector(".spotui-np-state"),
        title: root.querySelector(".spotui-np-title"),
        meta: root.querySelector(".spotui-np-meta"),
        bar: root.querySelector(".spotui-np-bar"),
        fill: root.querySelector(".spotui-np-bar-fill"),
        clock: root.querySelector(".spotui-np-clock"),
    };
    return nowPlayingEls;
}

function getNowPlayingSnapshot() {
    const item = Spicetify.Player?.data?.item;
    if (!item?.uri) {
        return {
            empty: true,
            state: "-",
            title: "Nothing playing",
            meta: "",
            bar: renderProgressBar(0, NP_PROGRESS_WIDTH),
            progress: 0,
            clock: "",
            uri: "",
        };
    }

    const track = normalizeTrackItem(item);
    const progress = playerGetProgress();
    const duration = playerGetDuration();
    const ratio = duration ? progress / duration : 0;
    const playing = playerIsPlaying();
    const repeat = REPEAT_LABELS[Spicetify.Player.getRepeat()] ?? "off";

    return {
        empty: false,
        state: playing ? ">" : "||",
        title: formatTrackLabel(track),
        meta:
            `vol ${Math.round(Spicetify.Player.getVolume() * 100)}%` +
            ` · shuf ${Spicetify.Player.getShuffle() ? "on" : "off"}` +
            ` · rep ${repeat}` +
            ` · ${Spicetify.Player.getHeart() ? "liked" : "like"}`,
        bar: renderProgressBar(ratio, NP_PROGRESS_WIDTH),
        progress: ratio,
        clock: `${Spicetify.Player.formatTime(progress)} / ${Spicetify.Player.formatTime(duration)}`,
        uri: item.uri,
    };
}

function renderNowPlayingBar(snapshot) {
    const els = getNowPlayingEls();
    if (!els) return;

    const data = snapshot || getNowPlayingSnapshot();
    els.root.classList.toggle("empty", data.empty);
    setTextIfChanged(els.state, data.state);
    setTextIfChanged(els.title, data.title);
    setTextIfChanged(els.meta, data.meta);
    nowPlayingLastProgress = -1;
    setNowPlayingProgressEl(els.bar, data.progress || 0);
    if (els.clock && data.clock !== nowPlayingLastClock) {
        nowPlayingLastClock = data.clock;
        els.clock.textContent = data.clock;
    }
    nowPlayingLastTrackUri = data.uri;
}

function scheduleNowPlayingProgress() {
    if (nowPlayingRaf !== null) return;
    if (document.hidden) return;
    if (isSpotuiTypingHot()) {
        if (nowPlayingTypingTimer === null) {
            nowPlayingTypingTimer = setTimeout(() => {
                nowPlayingTypingTimer = null;
                scheduleNowPlayingProgress();
            }, 280);
        }
        return;
    }

    nowPlayingRaf = requestAnimationFrame(() => {
        nowPlayingRaf = null;
        const now = performance.now();
        if (now - nowPlayingLastPaint < 220) return;
        nowPlayingLastPaint = now;

        const els = getNowPlayingEls();
        if (!els) return;

        const item = Spicetify.Player?.data?.item;
        if (!item?.uri) {
            if (nowPlayingLastTrackUri) renderNowPlayingBar();
            return;
        }

        // Progress ticks only need the bar/clock/state; full redraws happen on songchange.
        if (item.uri !== nowPlayingLastTrackUri) {
            renderNowPlayingBar();
            return;
        }

        const progress = playerGetProgress();
        const duration = playerGetDuration();
        setTextIfChanged(els.state, playerIsPlaying() ? ">" : "||");
        setNowPlayingProgressEl(els.bar, duration ? progress / duration : 0);
        const clock = `${Spicetify.Player.formatTime(progress)} / ${Spicetify.Player.formatTime(duration)}`;
        if (els.clock && clock !== nowPlayingLastClock) {
            nowPlayingLastClock = clock;
            els.clock.textContent = clock;
        }
        if (lyricsPanelOpen) syncLyricsHighlight();
    });
}

function initNowPlayingBar() {
    renderNowPlayingBar();
    if (nowPlayingBound || !Spicetify.Player?.addEventListener) return;
    nowPlayingBound = true;

    Spicetify.Player.addEventListener("songchange", () => {
        renderNowPlayingBar();
    });
    Spicetify.Player.addEventListener("onplaypause", () => renderNowPlayingBar());
    Spicetify.Player.addEventListener("onprogress", () => scheduleNowPlayingProgress());

    // Volume/shuffle/repeat do not always emit player events; poll lightly while visible.
    setInterval(() => {
        if (document.hidden || isSpotuiTypingHot()) return;
        if (document.body?.classList.contains("spotui-tui-hidden")) return;
        if (!document.getElementById("spotui-nowplaying")) return;
        renderNowPlayingBar();
    }, 2500);
}

function uriToOpenSpotifyUrl(uri) {
    const value = String(uri || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.includes(":local:") || value.includes(":collection")) return "";

    try {
        const parsed = Spicetify.URI?.from?.(value) || Spicetify.URI?.fromString?.(value);
        if (parsed) {
            if (typeof parsed.toURL === "function") {
                const url = parsed.toURL();
                if (url) return url;
            }
            if (typeof parsed.toURLPath === "function") {
                const path = parsed.toURLPath(true);
                if (path) {
                    const clean = String(path).startsWith("/") ? path : `/${path}`;
                    return `https://open.spotify.com${clean}`;
                }
            }
        }
    } catch {
        /* fall through */
    }

    const parts = value.split(":").filter(Boolean);
    if (parts[0] !== "spotify" || parts.length < 3) return "";
    if (parts[1] === "user" && parts.includes("playlist")) {
        return `https://open.spotify.com/playlist/${parts[parts.length - 1]}`;
    }
    return `https://open.spotify.com/${parts[1]}/${parts[parts.length - 1]}`;
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            /* fall through */
        }
    }

    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
    } catch {
        return false;
    }
}

function getNowPlayingAlbumTarget() {
    const item = Spicetify.Player?.data?.item;
    if (!item) return null;
    const meta = item.metadata || {};
    const uri =
        item.album?.uri ||
        meta.album_uri ||
        (item.album?.id ? `spotify:album:${item.album.id}` : "");
    if (!uri || !String(uri).includes(":album:")) return null;
    return {
        uri,
        name: item.album?.name || meta.album_title || meta.album || "Album",
        kind: "album",
    };
}

async function handleShareCommand(arg = "") {
    try {
        const mode = String(arg || "").trim().toLowerCase();
        let target = null;

        if (mode === "album") {
            target = getNowPlayingAlbumTarget();
            if (!target?.uri) {
                print("No album for the current track.", "error");
                return;
            }
        } else if (mode === "track") {
            target = getNowPlayingLibraryTarget();
            if (!target?.uri) {
                print("Nothing is playing.", "error");
                return;
            }
        } else if (!mode) {
            target = getPaneLibraryTarget() || getNowPlayingLibraryTarget();
            if (!target?.uri) {
                print("Nothing to share. Open home/playlist panes or play a track.", "error");
                return;
            }
        } else {
            print("Usage: share [album|track]", "error");
            return;
        }

        if (target.kind === "collection") {
            print("Can't share a local collection.", "error");
            return;
        }

        const url = uriToOpenSpotifyUrl(target.uri);
        if (!url) {
            print("Couldn't build a share link for this item.", "error");
            return;
        }

        const copied = await copyTextToClipboard(url);
        const label = libraryItemLabel(target.kind);
        print(url, "log");
        if (copied) {
            print(`Copied ${label} link: ${target.name}`);
        } else {
            print(url);
            print("Copy failed — link shown above.", "error");
        }
    } catch (err) {
        print("Share error: " + err.message, "error");
        console.error("SpoTUI share error:", err);
    }
}

function handleNowPlayingCommand() {
    const snapshot = getNowPlayingSnapshot();
    renderNowPlayingBar(snapshot);

    if (snapshot.empty) {
        print("Nothing is playing.", "error");
        return;
    }

    const item = Spicetify.Player.data?.item;
    const album = item?.album?.name || item?.metadata?.album_title || "";

    print(snapshot.title, "log");
    if (album) print(`Album: ${album}`, "log");
    print(`${snapshot.bar} ${snapshot.clock}`, "log");
    print(snapshot.meta.replace(/ · /g, " | "), "log");
    setStatus(`${snapshot.title}  ${snapshot.clock}`);
}

function libraryUriKind(uri) {
    const value = String(uri || "");
    if (value.includes(":track:")) return "track";
    if (value.includes(":album:")) return "album";
    if (value.includes(":playlist:") || Spicetify.URI?.isPlaylistV1OrV2?.(value)) return "playlist";
    if (value.includes(":collection")) return "collection";
    return homeCardTypeFromUri(value);
}

function libraryItemLabel(kind) {
    if (kind === "album") return "album";
    if (kind === "playlist") return "playlist";
    if (kind === "collection") return "collection";
    return "track";
}

async function isUriInLibrary(uri) {
    if (!uri) return false;
    const kind = libraryUriKind(uri);

    if (kind === "playlist") {
        try {
            const playlists = await getPlaylists();
            if (playlists.some((item) => item.uri === uri)) return true;
        } catch {
            /* fall through */
        }
        try {
            const userId =
                Spicetify.Platform?.Session?.userId ||
                Spicetify.Platform?.Session?.user?.id ||
                Spicetify.User?.id;
            if (userId) {
                const id = String(uri).split(":").pop();
                const res = await spotifyWebApiRequest(
                    "GET",
                    `/playlists/${encodeURIComponent(id)}/followers/contains?ids=${encodeURIComponent(userId)}`
                );
                if (Array.isArray(res)) return Boolean(res[0]);
            }
        } catch {
            /* ignore */
        }
        return false;
    }

    const api = Spicetify.Platform?.LibraryAPI;
    if (api?.contains) {
        try {
            const res = await api.contains(uri);
            if (Array.isArray(res)) return Boolean(res[0]);
            if (typeof res === "boolean") return res;
        } catch (err) {
            console.warn("SpoTUI LibraryAPI.contains failed:", err);
        }
    }

    try {
        const id = String(uri).split(":").pop();
        if (kind === "album") {
            const res = await spotifyWebApiRequest(
                "GET",
                `/me/albums/contains?ids=${encodeURIComponent(id)}`
            );
            return Boolean(Array.isArray(res) ? res[0] : res);
        }
        if (kind === "track") {
            const res = await spotifyWebApiRequest(
                "GET",
                `/me/tracks/contains?ids=${encodeURIComponent(id)}`
            );
            return Boolean(Array.isArray(res) ? res[0] : res);
        }
    } catch (err) {
        console.warn("SpoTUI library contains web failed:", err);
    }

    return false;
}

async function setUriLibraryState(uri, shouldLike) {
    if (!uri) throw new Error("No URI to like");
    const kind = libraryUriKind(uri);
    if (kind === "collection") {
        throw new Error("Liked Songs is already your library collection.");
    }

    if (kind === "playlist") {
        const id = String(uri).split(":").pop();
        if (shouldLike) {
            await spotifyWebApiRequest("PUT", `/playlists/${encodeURIComponent(id)}/followers`, {
                public: false,
            });
        } else {
            await spotifyWebApiRequest("DELETE", `/playlists/${encodeURIComponent(id)}/followers`);
        }
        return kind;
    }

    const api = Spicetify.Platform?.LibraryAPI;
    if (api?.add && api?.remove) {
        if (shouldLike) await api.add({ uris: [uri] });
        else await api.remove({ uris: [uri] });
        return kind;
    }

    const id = String(uri).split(":").pop();
    if (kind === "album") {
        if (shouldLike) await spotifyWebApiRequest("PUT", "/me/albums", { ids: [id] });
        else await spotifyWebApiRequest("DELETE", "/me/albums", { ids: [id] });
        return kind;
    }

    if (shouldLike) await spotifyWebApiRequest("PUT", "/me/tracks", { ids: [id] });
    else await spotifyWebApiRequest("DELETE", "/me/tracks", { ids: [id] });
    return kind;
}

function getPaneLibraryTarget() {
    if (!paneMode) return null;

    if (paneFocus === "left") {
        const item = paneLeftItems[popupSelected];
        if (!item || item.kind === "header" || !item.uri) return null;
        return {
            uri: item.uri,
            name: item.name || "Item",
            kind: item.type || libraryUriKind(item.uri),
        };
    }

    const track = popupTracks[popupTrackSelected];
    if (track?.uri) {
        return {
            uri: track.uri,
            name: track.name || "Track",
            kind: "track",
        };
    }
    return null;
}

function getNowPlayingLibraryTarget() {
    const item = Spicetify.Player?.data?.item;
    if (!item?.uri) return null;
    return {
        uri: item.uri,
        name: getTrackTitle(item, 0),
        kind: libraryUriKind(item.uri),
    };
}

async function handleLibraryLike(shouldLike, { toggle = false } = {}) {
    try {
        const target = getPaneLibraryTarget() || getNowPlayingLibraryTarget();
        if (!target?.uri) {
            print("Nothing selected to like. Open home/playlist panes or play a track.", "error");
            return;
        }

        if (target.kind === "collection") {
            print("Liked Songs is already your library collection.", "error");
            return;
        }

        const currentlyLiked =
            target.kind === "track" &&
            target.uri === Spicetify.Player?.data?.item?.uri &&
            typeof Spicetify.Player?.getHeart === "function"
                ? Spicetify.Player.getHeart()
                : await isUriInLibrary(target.uri);

        const next = toggle ? !currentlyLiked : shouldLike;
        if (currentlyLiked === next) {
            print(
                next
                    ? `Already liked: ${target.name}`
                    : `Not in your library: ${target.name}`
            );
            return;
        }

        // Fast path for the currently playing track.
        if (
            target.kind === "track" &&
            target.uri === Spicetify.Player?.data?.item?.uri &&
            typeof Spicetify.Player?.setHeart === "function"
        ) {
            Spicetify.Player.setHeart(next);
        } else {
            await setUriLibraryState(target.uri, next);
        }

        const label = libraryItemLabel(target.kind);
        print(next ? `Liked ${label}: ${target.name}` : `Removed ${label}: ${target.name}`);
    } catch (err) {
        print("Like error: " + err.message, "error");
        console.error("SpoTUI like error:", err);
    }
}

function handleHeartCommand(shouldLike) {
    handleLibraryLike(shouldLike, { toggle: false });
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
        const duration = playerGetDuration();
        if (!duration) {
            print("Nothing is playing.", "error");
            return;
        }
        if (!arg) {
            print("Usage: seek <mm:ss | seconds | 50% | +15 | -15>", "error");
            return;
        }

        const target = parseSeekTarget(arg, playerGetProgress(), duration);
        if (target === null) {
            print("Usage: seek <mm:ss | seconds | 50% | +15 | -15>", "error");
            return;
        }

        const position = clampNumber(Math.round(target), 0, duration);
        playerSeek(position);
        print(`Seeked to ${Spicetify.Player.formatTime(position)}`);
    } catch (err) {
        print("Seek error: " + err.message, "error");
    }
}

const LRCLIB_CLIENT = `SpoTUI v${SPOTUI_VERSION} (https://github.com/SouRyan/SpoTUI-By-SouRyan)`;
const LYRICS_STORAGE_KEY = "spotui:lyrics-open";

let lyricsPanelOpen = false;
let lyricsLoadToken = 0;
let lyricsActiveIndex = -1;
let lyricsCache = {
    uri: "",
    lines: [],
    synced: false,
    provider: "",
    instrumental: false,
    error: "",
};
let lyricsBound = false;

function getLyricsEls() {
    const root = document.getElementById("spotui-lyrics");
    if (!root) return null;
    return {
        root,
        track: root.querySelector(".spotui-lyrics-track"),
        meta: root.querySelector(".spotui-lyrics-meta"),
        lines: root.querySelector(".spotui-lyrics-lines"),
    };
}

function getCurrentTrackLyricsInfo() {
    const item = Spicetify.Player?.data?.item;
    if (!item?.uri || !String(item.uri).includes(":track:")) return null;

    const track = normalizeTrackItem(item);
    const album =
        item.album?.name ||
        item.metadata?.album_title ||
        item.metadata?.album ||
        "";
    const durationMs = Spicetify.Player.getDuration() || Number(item.duration?.milliseconds) || 0;

    return {
        uri: item.uri,
        title: track.name,
        artist: track.artist || "Unknown",
        album: album || track.name,
        durationMs,
        durationSec: Math.round(durationMs / 1000),
    };
}

function parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = [];

    for (const raw of String(lrcText).split(/\r?\n/)) {
        const stamps = [...raw.matchAll(/\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/g)];
        if (!stamps.length) continue;
        const text = raw.replace(/\[\d{1,2}:\d{2}(?:\.\d+)?\]/g, "").trim();
        if (!text) continue;
        for (const stamp of stamps) {
            lines.push({
                startTime: (Number(stamp[1]) * 60 + Number(stamp[2])) * 1000,
                text,
            });
        }
    }

    lines.sort((a, b) => a.startTime - b.startTime);
    return lines;
}

function plainLyricsToLines(plainText) {
    return String(plainText || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ startTime: -1, text }));
}

async function fetchSpotifyColorLyrics(uri) {
    if (!uri || !Spicetify.CosmosAsync?.get) return null;
    const id = uri.split(":").pop();
    if (!id) return null;

    try {
        const body = await Spicetify.CosmosAsync.get(
            `https://spclient.wg.spotify.com/color-lyrics/v2/track/${id}?format=json&vocalRemoval=false&market=from_token`
        );
        const lyrics = body?.lyrics;
        if (!lyrics?.lines?.length) return null;

        const synced = lyrics.syncType === "LINE_SYNCED";
        const lines = lyrics.lines
            .map((line) => ({
                startTime: synced ? Number(line.startTimeMs) || 0 : -1,
                text: String(line.words || "").trim(),
            }))
            .filter((line) => line.text && line.text !== "♪");

        if (!lines.length) return null;
        return { lines, synced, provider: "Spotify", instrumental: false };
    } catch {
        return null;
    }
}

async function fetchLrclibLyrics(info) {
    const headers = { "Lrclib-Client": LRCLIB_CLIENT };

    const exactParams = new URLSearchParams({
        track_name: info.title,
        artist_name: info.artist.split(",")[0].trim(),
        album_name: info.album || info.title,
        duration: String(info.durationSec || 0),
    });

    try {
        const exactRes = await fetch(`https://lrclib.net/api/get?${exactParams}`, { headers });
        if (exactRes.ok) {
            const data = await exactRes.json();
            return normalizeLrclibPayload(data);
        }
    } catch {
        /* try search below */
    }

    try {
        const searchParams = new URLSearchParams({
            track_name: info.title,
            artist_name: info.artist.split(",")[0].trim(),
        });
        const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams}`, { headers });
        if (!searchRes.ok) return null;
        const results = await searchRes.json();
        if (!Array.isArray(results) || !results.length) return null;

        const target = info.durationSec || 0;
        results.sort((a, b) => {
            const da = Math.abs((a.duration || 0) - target);
            const db = Math.abs((b.duration || 0) - target);
            const syncBonus = (x) => (x.syncedLyrics ? -0.5 : 0);
            return da + syncBonus(a) - (db + syncBonus(b));
        });

        return normalizeLrclibPayload(results[0]);
    } catch {
        return null;
    }
}

function normalizeLrclibPayload(data) {
    if (!data) return null;
    if (data.instrumental) {
        return { lines: [], synced: false, provider: "lrclib", instrumental: true };
    }

    const syncedLines = parseLrc(data.syncedLyrics);
    if (syncedLines.length) {
        return { lines: syncedLines, synced: true, provider: "lrclib", instrumental: false };
    }

    const plainLines = plainLyricsToLines(data.plainLyrics);
    if (plainLines.length) {
        return { lines: plainLines, synced: false, provider: "lrclib", instrumental: false };
    }

    return null;
}

async function resolveTrackLyrics(info) {
    const spotify = await fetchSpotifyColorLyrics(info.uri);
    if (spotify) return spotify;

    const lrclib = await fetchLrclibLyrics(info);
    if (lrclib) return lrclib;

    return {
        lines: [],
        synced: false,
        provider: "",
        instrumental: false,
        error: "No lyrics found",
    };
}

function renderLyricsEmpty(message, detail = "") {
    const els = getLyricsEls();
    if (!els?.lines) return;
    lyricsActiveIndex = -1;
    els.lines.classList.remove("unsynced");
    els.lines.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "spotui-lyrics-empty";
    empty.innerHTML = `<strong>${message}</strong>${detail ? `<div>${detail}</div>` : ""}`;
    els.lines.appendChild(empty);
}

function renderLyricsLines(lines, synced = true) {
    const els = getLyricsEls();
    if (!els?.lines) return;
    els.lines.innerHTML = "";
    els.lines.classList.toggle("unsynced", !synced);
    lyricsActiveIndex = -1;

    if (!lines.length) {
        renderLyricsEmpty("No lyrics", "Nothing to show for this track.");
        return;
    }

    lines.forEach((line, idx) => {
        const row = document.createElement("div");
        row.className = "spotui-lyrics-line";
        row.dataset.index = String(idx);
        row.textContent = line.text;
        els.lines.appendChild(row);
    });
}

function findActiveLyricIndex(lines, progressMs) {
    if (!lines?.length) return -1;
    if (lines[0].startTime < 0) return -1;

    let idx = -1;
    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].startTime <= progressMs) idx = i;
        else break;
    }
    return idx;
}

function syncLyricsHighlight(force = false) {
    if (!lyricsPanelOpen || !lyricsCache.synced || !lyricsCache.lines.length) return;
    if (!force && isSpotuiTypingHot()) return;

    const els = getLyricsEls();
    if (!els?.lines) return;

    const progress = Spicetify.Player.getProgress() || 0;
    const next = findActiveLyricIndex(lyricsCache.lines, progress);
    if (!force && next === lyricsActiveIndex) return;

    const rows = els.lines.children;
    const prev = lyricsActiveIndex;
    const setDistanceClass = (idx, active, near) => {
        const row = rows[idx];
        if (!row) return;
        row.classList.toggle("active", active);
        row.classList.toggle("near", near);
    };

    if (prev >= 0) {
        setDistanceClass(prev, false, false);
        setDistanceClass(prev - 1, false, false);
        setDistanceClass(prev + 1, false, false);
    }
    if (next >= 0) {
        setDistanceClass(next, true, false);
        setDistanceClass(next - 1, false, true);
        setDistanceClass(next + 1, false, true);
    }

    lyricsActiveIndex = next;
    if (next >= 0) {
        rows[next]?.scrollIntoView({ block: "center", behavior: "auto" });
    }
}

function setLyricsHeader(info, statusText) {
    const els = getLyricsEls();
    if (!els) return;
    if (els.track) {
        els.track.textContent = info
            ? `${info.title}${info.artist ? ` — ${info.artist}` : ""}`
            : "Nothing playing";
    }
    if (els.meta) els.meta.textContent = statusText || "";
}

async function loadLyricsForCurrentTrack() {
    const token = ++lyricsLoadToken;
    const info = getCurrentTrackLyricsInfo();
    const els = getLyricsEls();
    if (!els) return;

    if (!info) {
        lyricsCache = { uri: "", lines: [], synced: false, provider: "", instrumental: false, error: "" };
        setLyricsHeader(null, "");
        renderLyricsEmpty("Nothing playing", "Start a track, then run lyrics again.");
        return;
    }

    if (lyricsCache.uri === info.uri && (lyricsCache.lines.length || lyricsCache.instrumental || lyricsCache.error)) {
        setLyricsHeader(
            info,
            lyricsCache.instrumental
                ? "instrumental"
                : `${lyricsCache.synced ? "synced" : "unsynced"} · ${lyricsCache.provider || "cache"}`
        );
        if (lyricsCache.instrumental) {
            renderLyricsEmpty("Instrumental", "No vocals to show for this track.");
        } else if (lyricsCache.error) {
            renderLyricsEmpty("No lyrics", lyricsCache.error);
        } else {
            renderLyricsLines(lyricsCache.lines, lyricsCache.synced);
            syncLyricsHighlight(true);
        }
        return;
    }

    setLyricsHeader(info, "fetching…");
    renderLyricsEmpty("Fetching lyrics", `${info.title} — ${info.artist}`);

    const result = await resolveTrackLyrics(info);
    if (token !== lyricsLoadToken || !lyricsPanelOpen) return;

    lyricsCache = {
        uri: info.uri,
        lines: result.lines || [],
        synced: Boolean(result.synced),
        provider: result.provider || "",
        instrumental: Boolean(result.instrumental),
        error: result.error || "",
    };

    if (lyricsCache.instrumental) {
        setLyricsHeader(info, "instrumental");
        renderLyricsEmpty("Instrumental", "No vocals to show for this track.");
        return;
    }

    if (!lyricsCache.lines.length) {
        setLyricsHeader(info, "not found");
        renderLyricsEmpty("No lyrics found", "Tried Spotify and lrclib for this track.");
        return;
    }

    setLyricsHeader(
        info,
        `${lyricsCache.synced ? "synced" : "unsynced"} · ${lyricsCache.provider}`
    );
    renderLyricsLines(lyricsCache.lines, lyricsCache.synced);
    syncLyricsHighlight(true);
}

function storeLyricsOpen(open) {
    try {
        localStorage.setItem(LYRICS_STORAGE_KEY, open ? "1" : "0");
    } catch {
        /* ignore */
    }
}

function openLyricsPanel() {
    if (paneMode) closePanes();

    lyricsPanelOpen = true;
    storeLyricsOpen(true);
    document.body.classList.add("spotui-lyrics-panel");

    const root = document.getElementById("spotui-lyrics");
    if (root) root.hidden = false;

    bindLyricsEvents();
    loadLyricsForCurrentTrack();
}

function closeLyricsPanel() {
    lyricsPanelOpen = false;
    lyricsLoadToken += 1;
    storeLyricsOpen(false);
    document.body.classList.remove("spotui-lyrics-panel");

    const root = document.getElementById("spotui-lyrics");
    if (root) root.hidden = true;
}

function bindLyricsEvents() {
    if (lyricsBound || !Spicetify.Player?.addEventListener) return;
    lyricsBound = true;

    Spicetify.Player.addEventListener("songchange", () => {
        if (!lyricsPanelOpen) return;
        lyricsCache = {
            uri: "",
            lines: [],
            synced: false,
            provider: "",
            instrumental: false,
            error: "",
        };
        loadLyricsForCurrentTrack();
    });
}

function handleLyricsCommand(arg = "") {
    const mode = String(arg || "").trim().toLowerCase();

    if (mode === "on" || mode === "open") {
        openLyricsPanel();
        print("Lyrics open");
        return;
    }

    if (mode === "off" || mode === "close") {
        closeLyricsPanel();
        print("Lyrics closed");
        return;
    }

    if (mode && mode !== "toggle") {
        print("Usage: lyrics [on|off]", "error");
        return;
    }

    if (lyricsPanelOpen) {
        closeLyricsPanel();
        print("Lyrics closed");
        return;
    }

    openLyricsPanel();
    print("Lyrics open");
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
            if (playerIsPlaying()) playerTogglePlay();
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
    syncPipBackdrop();
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

function findNativePlayerBar() {
    return document.querySelector(
        '[data-testid="now-playing-bar"], aside[data-testid="now-playing-bar"], .Root__now-playing-bar, .main-appShell-playbackBar, .qEDMggbdvFQOvRAwmrIT'
    );
}

function clearPlayerBarKeepMarks() {
    document.querySelectorAll("[data-spotui-bar-keep]").forEach((el) => {
        el.removeAttribute("data-spotui-bar-keep");
    });
}

function markPlayerBarAncestors() {
    clearPlayerBarKeepMarks();
    if (playerBarHidden || !document.body) return;
    if (document.body.classList.contains("spotui-spotify-enabled")) return;
    if (document.body.classList.contains("spotui-search-mode")) return;

    const bar = findNativePlayerBar();
    if (!bar) return;

    let node = bar;
    while (node && node !== document.body) {
        node.setAttribute("data-spotui-bar-keep", "1");
        if (node.classList?.contains("Root")) break;
        node = node.parentElement;
    }
}

let playerBarKeepTimer = null;
let playerBarKeepTries = 0;

function schedulePlayerBarKeepMarks() {
    markPlayerBarAncestors();
    if (playerBarKeepTimer) {
        clearInterval(playerBarKeepTimer);
        playerBarKeepTimer = null;
    }
    if (playerBarHidden) return;
    playerBarKeepTries = 0;
    playerBarKeepTimer = setInterval(() => {
        playerBarKeepTries += 1;
        markPlayerBarAncestors();
        if (playerBarKeepTries >= 40) {
            clearInterval(playerBarKeepTimer);
            playerBarKeepTimer = null;
        }
    }, 500);
}

function setPlayerBarHidden(hidden) {
    playerBarHidden = !!hidden;
    document.body.classList.toggle("spotui-bar-hidden", playerBarHidden);
    try {
        localStorage.setItem(BAR_STORAGE_KEY, playerBarHidden ? "1" : "0");
    } catch {
        /* ignore */
    }
    if (playerBarHidden) clearPlayerBarKeepMarks();
    else schedulePlayerBarKeepMarks();
}

function restorePlayerBar() {
    try {
        setPlayerBarHidden(localStorage.getItem(BAR_STORAGE_KEY) === "1");
    } catch {
        setPlayerBarHidden(false);
    }
}

function handlePlayerBarCommand(arg) {
    const mode = arg.trim().toLowerCase();
    if (!mode) {
        setPlayerBarHidden(!playerBarHidden);
        print(playerBarHidden ? "Player bar hidden" : "Player bar visible");
        return;
    }
    if (mode === "off" || mode === "hide" || mode === "hidden") {
        setPlayerBarHidden(true);
        print("Player bar hidden");
        return;
    }
    if (mode === "on" || mode === "show" || mode === "visible") {
        setPlayerBarHidden(false);
        print("Player bar visible");
        return;
    }
    if (mode === "toggle") {
        setPlayerBarHidden(!playerBarHidden);
        print(playerBarHidden ? "Player bar hidden" : "Player bar visible");
        return;
    }
    print("Usage: bar [on|off]", "error");
}

function isPipOpen() {
    return !!(pipWindow && !pipWindow.closed);
}

function getCoverArtUrl() {
    const item = Spicetify.Player?.data?.item;
    if (!item) return "";
    return (
        item.album?.images?.[0]?.url ||
        item.images?.[0]?.url ||
        item.metadata?.image_xlarge_url ||
        item.metadata?.image_large_url ||
        item.metadata?.image_url ||
        ""
    );
}

function getActiveSchemeColors() {
    return getAllSchemes().find((scheme) => scheme.id === activeSchemeId) || SPOTUI_SCHEMES[0];
}

function closeSpotuiPip() {
    if (isPipOpen()) {
        try {
            pipWindow.close();
        } catch {
            /* ignore */
        }
    }
    pipWindow = null;
}

function bindPipEvents() {
    if (pipEventsBound || !Spicetify.Player?.addEventListener) return;
    pipEventsBound = true;
    Spicetify.Player.addEventListener("songchange", () => renderSpotuiPip());
    Spicetify.Player.addEventListener("onplaypause", () => renderSpotuiPip());
    Spicetify.Player.addEventListener("onprogress", () => schedulePipProgress());
}

function schedulePipProgress() {
    if (pipProgressRaf !== null || !isPipOpen()) return;
    pipProgressRaf = requestAnimationFrame(() => {
        pipProgressRaf = null;
        if (!isPipOpen()) return;
        const progress = Spicetify.Player.getProgress() || 0;
        const duration = Spicetify.Player.getDuration() || 0;
        const fill = pipWindow.document.getElementById("spotui-pip-fill");
        const clock = pipWindow.document.getElementById("spotui-pip-clock");
        if (fill) fill.style.width = `${duration ? (progress / duration) * 100 : 0}%`;
        if (clock) {
            clock.textContent =
                `${Spicetify.Player.formatTime(progress)} / ${Spicetify.Player.formatTime(duration)}`;
        }
    });
}

function syncPipBackdrop() {
    if (!isPipOpen()) return;
    const bg = pipWindow.document.getElementById("spotui-pip-bg");
    if (!bg) return;
    if (backdropUrl) {
        bg.style.backgroundImage = `url("${backdropUrl.replace(/["\\]/g, encodeURIComponent)}")`;
        bg.style.opacity = String(backdropOpacity);
    } else {
        bg.style.backgroundImage = "";
        bg.style.opacity = "0";
    }
}

function renderSpotuiPip() {
    if (!isPipOpen()) return;
    const doc = pipWindow.document;
    const item = Spicetify.Player?.data?.item;
    const track = item ? normalizeTrackItem(item) : null;
    const playing = !!Spicetify.Player?.isPlaying?.();
    const progress = Spicetify.Player?.getProgress?.() || 0;
    const duration = Spicetify.Player?.getDuration?.() || 0;
    const cover = getCoverArtUrl();

    const title = doc.getElementById("spotui-pip-title");
    const artist = doc.getElementById("spotui-pip-artist");
    const play = doc.getElementById("spotui-pip-play");
    const art = doc.getElementById("spotui-pip-art");
    const fill = doc.getElementById("spotui-pip-fill");
    const clock = doc.getElementById("spotui-pip-clock");

    if (title) title.textContent = track?.name || "Nothing playing";
    if (artist) artist.textContent = track?.artist || "";
    if (play) play.textContent = playing ? "||" : ">";
    if (art) {
        if (cover) {
            art.style.backgroundImage = `url("${cover.replace(/["\\]/g, encodeURIComponent)}")`;
            art.classList.add("has-art");
        } else {
            art.style.backgroundImage = "";
            art.classList.remove("has-art");
        }
    }
    if (fill) fill.style.width = `${duration ? (progress / duration) * 100 : 0}%`;
    if (clock) {
        clock.textContent =
            `${Spicetify.Player.formatTime(progress)} / ${Spicetify.Player.formatTime(duration)}`;
    }
    syncPipBackdrop();
}

function updatePipLayout(win) {
    if (!win || win.closed) return;
    const body = win.document.body;
    if (!body) return;
    const width = win.innerWidth || 0;
    const height = win.innerHeight || 0;
    const row = height < 360 || (width >= height && height < 420);
    const tiny = height < 230 || width < 250;
    body.classList.toggle("layout-row", row);
    body.classList.toggle("layout-tiny", tiny);
}

function seekFromPipProgress(event) {
    try {
        const duration = playerGetDuration();
        if (!duration) return;
        const bar = event.currentTarget;
        const rect = bar.getBoundingClientRect();
        const ratio = clampNumber((event.clientX - rect.left) / rect.width, 0, 1);
        playerSeek(Math.round(ratio * duration));
    } catch {
        /* ignore */
    }
}

function setupSpotuiPip(win) {
    const scheme = getActiveSchemeColors();
    const doc = win.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>LazyUI</title>
<style>
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${scheme.bg};
  color: ${scheme.text};
  font-family: ${fontFamilyValue(scheme.font)};
  user-select: none;
}
#spotui-pip-bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
#spotui-pip-dim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.92) 100%);
  pointer-events: none;
  z-index: 0;
}
#spotui-pip-ui {
  position: relative;
  z-index: 1;
  height: 100%;
  box-sizing: border-box;
  padding: 40px 14px 14px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  pointer-events: auto;
}
#spotui-pip-drag {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 34px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: grab;
  color: ${scheme.accent};
  font-size: 11px;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0));
}
#spotui-pip-drag:active {
  cursor: grabbing;
}
#spotui-pip-drag-hint {
  color: ${scheme.muted};
  font-size: 10px;
  letter-spacing: 0;
  opacity: 0.8;
}
#spotui-pip-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  min-height: 0;
}
#spotui-pip-art {
  width: min(42vw, 120px);
  height: min(42vw, 120px);
  border: 1px solid ${scheme.accent};
  background: ${scheme.surface};
  background-size: cover;
  background-position: center;
  flex: 0 0 auto;
}
#spotui-pip-art.has-art {
  box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
}
#spotui-pip-meta {
  min-width: 0;
  flex: 1 1 auto;
}
#spotui-pip-title {
  font-size: clamp(12px, 3.6vw, 15px);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#spotui-pip-artist {
  font-size: clamp(10px, 3vw, 12px);
  color: ${scheme.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
#spotui-pip-progress {
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  box-shadow: inset 0 0 0 1px ${scheme.divider};
  margin-top: 8px;
  cursor: pointer;
  touch-action: none;
  overflow: hidden;
}
#spotui-pip-fill {
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${scheme.accent}bb, ${scheme.accent});
  box-shadow: 0 0 8px ${scheme.accent}66;
  pointer-events: none;
}
#spotui-pip-clock {
  font-size: 10px;
  color: ${scheme.muted};
  margin-top: 4px;
}
#spotui-pip-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 0 0 auto;
}
#spotui-pip-controls button {
  appearance: none;
  border: 1px solid transparent;
  background: rgba(0,0,0,0.35);
  color: ${scheme.accent};
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 14px;
  min-width: 48px;
  min-height: 40px;
}
#spotui-pip-controls button:hover {
  border-color: ${scheme.accent};
  background: rgba(0,0,0,0.55);
}
#spotui-pip-play {
  font-size: 18px !important;
  min-width: 56px;
}

/* Wide / short window: cover beside title */
body.layout-row #spotui-pip-ui {
  justify-content: center;
  gap: 10px;
  padding: 36px 12px 12px;
}
body.layout-row #spotui-pip-main {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
body.layout-row #spotui-pip-art {
  width: 72px;
  height: 72px;
}
body.layout-row #spotui-pip-drag {
  height: 28px;
  font-size: 10px;
}

/* Very small window */
body.layout-tiny #spotui-pip-ui {
  padding: 30px 8px 8px;
  gap: 6px;
}
body.layout-tiny #spotui-pip-drag-hint {
  display: none;
}
body.layout-tiny #spotui-pip-main {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
body.layout-tiny #spotui-pip-art {
  width: 44px;
  height: 44px;
}
body.layout-tiny #spotui-pip-progress {
  height: 6px;
  margin-top: 4px;
}
body.layout-tiny #spotui-pip-clock {
  display: none;
}
body.layout-tiny #spotui-pip-controls button {
  min-width: 40px;
  min-height: 34px;
  padding: 6px 10px;
  font-size: 14px;
}
</style></head><body>
<div id="spotui-pip-bg"></div>
<div id="spotui-pip-dim"></div>
<div id="spotui-pip-ui">
  <div id="spotui-pip-drag" title="Drag to move">
    <span>LazyUI</span>
    <span id="spotui-pip-drag-hint">drag here</span>
  </div>
  <div id="spotui-pip-main">
    <div id="spotui-pip-art"></div>
    <div id="spotui-pip-meta">
      <div id="spotui-pip-title">Nothing playing</div>
      <div id="spotui-pip-artist"></div>
      <div id="spotui-pip-progress"><div id="spotui-pip-fill"></div></div>
      <div id="spotui-pip-clock">0:00 / 0:00</div>
    </div>
  </div>
  <div id="spotui-pip-controls">
    <button type="button" id="spotui-pip-prev" title="Previous">&lt;&lt;</button>
    <button type="button" id="spotui-pip-play" title="Play/Pause">&gt;</button>
    <button type="button" id="spotui-pip-next" title="Next">&gt;&gt;</button>
  </div>
</div>
</body></html>`);
    doc.close();

    const bindBtn = (id, action) => {
        const btn = doc.getElementById(id);
        if (!btn) return;
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            try { action(); } catch { /* ignore */ }
        });
    };

    bindBtn("spotui-pip-prev", () => playerBack());
    bindBtn("spotui-pip-next", () => playerNext());
    bindBtn("spotui-pip-play", () => playerTogglePlay());

    const progress = doc.getElementById("spotui-pip-progress");
    if (progress) {
        progress.addEventListener("click", seekFromPipProgress);
    }

    enablePipWindowDrag(win);

    const onResize = () => updatePipLayout(win);
    win.addEventListener("resize", onResize);
    if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(onResize);
        ro.observe(doc.documentElement);
    }
    updatePipLayout(win);

    win.addEventListener("pagehide", () => {
        if (pipWindow === win) pipWindow = null;
    });

    bindPipEvents();
    renderSpotuiPip();
}

function enablePipWindowDrag(win) {
    const handle = win.document.getElementById("spotui-pip-drag");
    if (!handle) return;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        dragging = true;
        lastX = event.screenX;
        lastY = event.screenY;
        try {
            handle.setPointerCapture(event.pointerId);
        } catch {
            /* ignore */
        }
        event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const dx = event.screenX - lastX;
        const dy = event.screenY - lastY;
        lastX = event.screenX;
        lastY = event.screenY;
        if (!dx && !dy) return;
        try {
            win.moveBy(dx, dy);
        } catch {
            /* Document PiP / locked windows may reject moveBy */
        }
    });

    const stopDrag = () => {
        dragging = false;
    };
    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);
    handle.addEventListener("lostpointercapture", stopDrag);
}

async function openSpotuiPip() {
    if (isPipOpen()) {
        closeSpotuiPip();
        print("Miniplayer closed");
        return false;
    }

    // Prefer a real popup window so the user can drag it around the desktop.
    try {
        const left = Math.max((window.screen?.availWidth || 1200) - PIP_WIDTH - 24, 0);
        pipWindow = window.open(
            "about:blank",
            "SpoTUIMiniplayer",
            `width=${PIP_WIDTH},height=${PIP_HEIGHT},left=${left},top=24,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
        );
        if (pipWindow) {
            setupSpotuiPip(pipWindow);
            print("Miniplayer opened — drag the top bar to move");
            return true;
        }
    } catch (err) {
        console.warn("SpoTUI popup miniplayer failed, trying Document PiP:", err);
    }

    if (window.documentPictureInPicture?.requestWindow) {
        try {
            pipWindow = await window.documentPictureInPicture.requestWindow({
                width: PIP_WIDTH,
                height: PIP_HEIGHT,
            });
            setupSpotuiPip(pipWindow);
            print("Miniplayer opened (PiP) — drag the top bar to move");
            return true;
        } catch (err) {
            console.warn("SpoTUI Document PiP failed:", err);
        }
    }

    print("Could not open miniplayer (popup blocked?).", "error");
    return false;
}

async function handleMiniCommand(arg) {
    const mode = arg.trim().toLowerCase();
    if (!mode || mode === "toggle") {
        await openSpotuiPip();
        return;
    }
    if (mode === "on" || mode === "true" || mode === "1" || mode === "open") {
        if (isPipOpen()) {
            print("Miniplayer already open");
            return;
        }
        await openSpotuiPip();
        return;
    }
    if (mode === "off" || mode === "false" || mode === "0" || mode === "close") {
        if (!isPipOpen()) {
            print("Miniplayer already closed");
            return;
        }
        closeSpotuiPip();
        print("Miniplayer closed");
        return;
    }
    print("Usage: mini [on|off]", "error");
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

    const parts = query.split(/\s+/);
    const head = parts[0].toLowerCase();

    if (head === "auto" || head === "reset") {
        applyScheme(null);
        storeScheme(null);
        print("Theme: following the Spicetify scheme");
        return;
    }

    if (head === "custom" || head === "edit") {
        openCustomThemePopup({ seed: readCustomScheme(), returnToPicker: false });
        return;
    }

    if (head === "set") {
        if (parts.length < 3) {
            print(
                `Usage: theme set <${SCHEME_COLOR_TOKENS.join("|")}> <#hex|r g b>`,
                "error"
            );
            return;
        }

        const token = parts[1].toLowerCase();
        if (!SCHEME_COLOR_TOKENS.includes(token)) {
            print(`Unknown token "${parts[1]}". Try: ${SCHEME_COLOR_TOKENS.join(", ")}`, "error");
            return;
        }

        const colorArg = parts.slice(2).join(" ");
        const updated = setCustomTokenColor(token, colorArg, { persist: true, activate: true });
        if (!updated) {
            print(`Invalid color "${colorArg}". Use #rrggbb or r g b`, "error");
            return;
        }

        print(`Custom ${token}: ${updated[token]}`);
        return;
    }

    if (head === "show" || head === "get") {
        const custom = readCustomScheme();
        const active = activeSchemeId || "auto";
        print(`Theme: ${active}`);
        SCHEME_COLOR_TOKENS.forEach((token) => {
            print(`  ${token}: ${custom[token]}`);
        });
        print(`  font: ${custom.font}`);
        return;
    }

    const scheme = findScheme(query);
    if (!scheme) {
        const names = getAllSchemes().map((entry) => entry.id).join(", ");
        print(`Unknown theme "${query}". Try: ${names}, auto, custom, set`, "error");
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
    paneLeftItems = playlists.slice();
    popupSelected = 0;
    popupTracks = [];
    popupTrackTitle = "";
    popupTrackContext = null;
    popupTrackSelected = 0;
    paneRightLoaded = false;
    openPanes("browse", "left");
    schedulePlaylistPreview();
}

async function fetchPlaylistItems(contextUri) {
    const items = [];

    if (Spicetify.Platform?.PlaylistAPI?.getContents) {
        try {
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
            if (items.length) return items;
        } catch (err) {
            console.warn("SpoTUI PlaylistAPI.getContents failed:", err);
        }
    }

    const id = String(contextUri || "").split(":").pop();
    if (!id) return items;
    const res = await spotifyWebApiRequest(
        "GET",
        `/playlists/${encodeURIComponent(id)}/tracks?limit=100${marketQuery()}`
    );
    return coerceList(res?.items);
}

function schedulePlaylistPreview() {
    if (paneMode !== "browse") return;
    clearTimeout(panePreviewTimer);
    const playlist = paneLeftItems[popupSelected];
    if (!playlist?.uri) return;

    beginRightPaneLoad(playlist.name, playlist.uri);
    renderPanes();

    panePreviewTimer = setTimeout(() => {
        loadPlaylistTracksIntoPane(playlist, { play: false, focusRight: false, silent: true });
    }, 220);
}

async function loadPlaylistTracksIntoPane(playlist, { play = false, focusRight = true, silent = false } = {}) {
    if (!playlist?.uri) return;
    await loadHomeItemIntoPane(
        { ...playlist, type: playlist.type || "playlist" },
        { play, focusRight, silent }
    );
}

function queueSelectedPaneTrack() {
    const track = popupTracks[popupTrackSelected];
    if (!track?.uri) {
        print("No track selected to queue.", "error");
        return;
    }
    queueTrack(track.uri)
        .then(() => {
            print(`Queued: ${formatTrackLabel(track)}`);
            if (paneMode === "queue") {
                setTimeout(() => refreshQueuePanes(), 150);
            }
        })
        .catch((err) => print("Queue error: " + err.message, "error"));
}

async function openPlaylistTracksPopup() {
    try {
        const contextUri = getCurrentPlaylistContextUri();
        if (!contextUri || !Spicetify.URI.isPlaylistV1OrV2(contextUri)) {
            print("List error: not currently playing a playlist.", "error");
            return;
        }

        try {
            playlists = await getPlaylists();
        } catch {
            playlists = [];
        }
        paneLeftItems = playlists.slice();
        const selectedIdx = playlists.findIndex((p) => p.uri === contextUri);
        popupSelected = Math.max(selectedIdx, 0);

        const items = await fetchPlaylistItems(contextUri);
        popupTracks = dedupeTracks(
            items
                .filter((item) => item && item.uri && item.isPlayable !== false)
                .map((item, index) => normalizeTrackItem(item, index))
        );
        const current = playlists[popupSelected];
        popupTrackTitle = current?.name || "Playlist tracks";
        popupTrackContext = Spicetify.Player.data?.context || { uri: contextUri };
        lastPlaylistContextUri = contextUri;
        const currentTrackUri = Spicetify.Player.data?.item?.uri;
        popupTrackSelected = Math.max(findTrackIndexByUri(popupTracks, currentTrackUri), 0);
        finishRightPaneLoad();
        openPanes("browse", "right");
    } catch (err) {
        print("List error: " + err.message, "error");
        console.error("Playlist tracks pane error:", err);
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

function refreshQueuePanes() {
    if (paneMode !== "queue") return;

    const tracks = getQueueTracks();
    popupTracks = tracks;
    popupTrackTitle = "Queue";

    const currentTrackUri = Spicetify.Player.data?.item?.uri;
    const currentIndex = findTrackIndexByUri(popupTracks, currentTrackUri);
    if (currentIndex >= 0) {
        popupTrackSelected = currentIndex;
    } else if (popupTrackSelected >= popupTracks.length) {
        popupTrackSelected = Math.max(popupTracks.length - 1, 0);
    }

    paneLeftItems = [
        {
            name: `${popupTracks.length} track${popupTracks.length === 1 ? "" : "s"} in queue`,
            uri: null,
        },
    ];
    popupSelected = 0;
    finishRightPaneLoad();
    renderPanes();
}

let queueEventsBound = false;

function bindQueueEvents() {
    if (queueEventsBound || !Spicetify.Player?.addEventListener) return;
    queueEventsBound = true;

    Spicetify.Player.addEventListener("songchange", () => {
        if (paneMode !== "queue") return;
        refreshQueuePanes();
        // Spicetify.Queue can lag the songchange event by a tick.
        setTimeout(() => refreshQueuePanes(), 250);
    });
}

function openQueuePopup() {
    openPanes("queue", "right");
    refreshQueuePanes();
    bindQueueEvents();
}

function initPanes() {
    const root = document.getElementById("spotui-panes");
    if (!root || panesBound) return;
    panesBound = true;
    root.addEventListener("keydown", (e) => {
        handlePaneKeydown(e);
    });
}

function openPanes(mode, focus = "left") {
    if (lyricsPanelOpen) closeLyricsPanel();
    paneMode = mode;
    paneFocus = focus === "right" ? "right" : "left";
    paneDrilledDown = false;
    document.body.classList.add("spotui-pane-mode");
    const root = document.getElementById("spotui-panes");
    if (root) root.hidden = false;
    renderPanes();
    focusPane(paneFocus);
}

function closePanes() {
    if (paneMode === "search") clearSearchCaches();
    clearTimeout(panePreviewTimer);
    panePreviewTimer = null;
    paneLoadSeq += 1;
    paneMode = null;
    paneFocus = "left";
    paneRightLoaded = false;
    paneRightLoading = false;
    paneDrilledDown = false;
    paneLeftItems = [];
    paneSearchQuery = "";
    paneSearchRootItems = [];
    paneSearchRootSelected = 0;
    paneSearchArtists = [];
    paneSearchTracks = [];
    paneSearchScope = "all";
    paneSearchEnrichSeq += 1;
    clearTimeout(paneSearchEnrichTimer);
    paneSearchEnrichTimer = null;
    popupTracks = [];
    popupTrackSelected = 0;
    popupTrackTitle = "";
    popupTrackContext = null;
    document.body.classList.remove("spotui-pane-mode");
    const root = document.getElementById("spotui-panes");
    if (root) root.hidden = true;
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
}

function clearPaneRight() {
    popupTracks = [];
    popupTrackSelected = 0;
    popupTrackTitle = "";
    popupTrackContext = null;
    paneRightLoaded = false;
    paneRightLoading = false;
    paneDrilledDown = false;
    renderPanes();
    focusPane("left");
}

function focusPane(side) {
    paneFocus = side === "right" ? "right" : "left";
    const left = document.getElementById("spotui-pane-left");
    const right = document.getElementById("spotui-pane-right");
    left?.classList.toggle("active", paneFocus === "left");
    right?.classList.toggle("active", paneFocus === "right");
    const target = paneFocus === "right" ? right : left;
    target?.focus();
    scrollSelectedPaneRowIntoView();
}

function fillPaneList(listEl, items, selected, formatter, emptyText) {
    if (!items.length) {
        listEl.innerHTML = "";
        const empty = document.createElement("div");
        empty.className = "spotui-pane-empty";
        empty.textContent = emptyText;
        listEl.appendChild(empty);
        return;
    }

    const existing = listEl.querySelectorAll(".spotui-pane-row");
    if (existing.length === items.length && !listEl.querySelector(".spotui-pane-empty")) {
        items.forEach((item, idx) => {
            const row = existing[idx];
            const text = formatter(item, idx);
            if (row.textContent !== text) row.textContent = text;
            row.classList.toggle("selected", idx === selected);
            row.classList.toggle("is-header", item?.kind === "header");
        });
        return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((item, idx) => {
        const row = document.createElement("div");
        row.className =
            "spotui-pane-row" +
            (idx === selected ? " selected" : "") +
            (item?.kind === "header" ? " is-header" : "");
        row.textContent = formatter(item, idx);
        frag.appendChild(row);
    });
    listEl.innerHTML = "";
    listEl.appendChild(frag);
}

function selectPaneRow(side, index) {
    const paneId = side === "right" ? "spotui-pane-right" : "spotui-pane-left";
    const list = document.querySelector(`#${paneId} .spotui-pane-list`);
    if (!list) return;
    const current = list.querySelector(".spotui-pane-row.selected");
    current?.classList.remove("selected");
    const next = list.querySelectorAll(".spotui-pane-row")[index];
    next?.classList.add("selected");
    scrollSelectedPaneRowIntoView();
}

function renderPanes() {
    const left = document.getElementById("spotui-pane-left");
    const right = document.getElementById("spotui-pane-right");
    if (!left || !right || !paneMode) return;

    const leftTitle = left.querySelector(".spotui-pane-title");
    const leftList = left.querySelector(".spotui-pane-list");
    const rightTitle = right.querySelector(".spotui-pane-title");
    const rightList = right.querySelector(".spotui-pane-list");

    if (paneMode === "browse") {
        leftTitle.textContent =
            "Playlists \u2014 \u2191/\u2193 preview \u00b7 Enter play \u00b7 a queue \u00b7 l like \u00b7 n new \u00b7 Esc";
        fillPaneList(
            leftList,
            paneLeftItems,
            popupSelected,
            (p, idx) => `${idx + 1}. ${p.name}`,
            "No playlists found."
        );
    } else if (paneMode === "search") {
        leftTitle.textContent =
            `${paneSearchScope === "all" ? "Search" : `Search ${searchScopeLabel(paneSearchScope)}`} \u2014 \u2191/\u2193 preview \u00b7 Enter open \u00b7 a queue \u00b7 l like \u00b7 Esc`;
        fillPaneList(
            leftList,
            paneLeftItems,
            popupSelected,
            (item, idx) => formatHomeLeftLabel(item, idx),
            paneSearchQuery ? `No results for "${paneSearchQuery}".` : "No search."
        );
    } else if (paneMode === "queue") {
        leftTitle.textContent = "Queue \u2014 a re-queue \u00b7 l like \u00b7 Esc close";
        fillPaneList(
            leftList,
            paneLeftItems,
            popupSelected,
            (item) => item.name,
            "Queue is empty."
        );
    } else if (paneMode === "home") {
        leftTitle.textContent =
            "Home \u2014 \u2191/\u2193 preview \u00b7 Enter play \u00b7 a queue \u00b7 l like \u00b7 Esc";
        fillPaneList(
            leftList,
            paneLeftItems,
            popupSelected,
            (item, idx) => formatHomeLeftLabel(item, idx),
            "No Made for you / Recents yet."
        );
    }

    if (paneRightLoading) {
        rightTitle.textContent = `${popupTrackTitle || "Tracks"} \u2014 loading...`;
        fillPaneList(rightList, [], 0, () => "", "Loading tracks...");
    } else if (popupTracks.length) {
        rightTitle.textContent =
            `${popupTrackTitle || "Tracks"} \u2014 \u2191/\u2193 \u00b7 Enter play \u00b7 a queue \u00b7 l like`;
        fillPaneList(
            rightList,
            popupTracks,
            popupTrackSelected,
            (track, idx) => `${idx + 1}. ${track.name}${track.artist ? " - " + track.artist : ""}`,
            "No tracks found."
        );
    } else if (paneRightLoaded) {
        rightTitle.textContent = `${popupTrackTitle || "Tracks"} \u2014 empty`;
        fillPaneList(rightList, [], 0, () => "", "No tracks found.");
    } else {
        rightTitle.textContent = "Tracks";
        fillPaneList(
            rightList,
            [],
            0,
            () => "",
            paneMode === "home"
                ? "Pick a playlist on the left."
                : paneMode === "search"
                  ? "Pick a mix, album, or track on the left."
                  : "Move through playlists to preview tracks."
        );
    }

    left.classList.toggle("active", paneFocus === "left");
    right.classList.toggle("active", paneFocus === "right");
    scrollSelectedPaneRowIntoView();
}

function scrollSelectedPaneRowIntoView() {
    requestAnimationFrame(() => {
        const paneId = paneFocus === "right" ? "spotui-pane-right" : "spotui-pane-left";
        const selectedRow = document.querySelector(`#${paneId} .spotui-pane-row.selected`);
        if (selectedRow?.scrollIntoView) {
            selectedRow.scrollIntoView({ block: "nearest" });
        }
    });
}

async function handlePaneKeydown(e) {
    if (!paneMode) return;

    if (e.key === "Tab") {
        e.preventDefault();
        focusPane(paneFocus === "left" ? "right" : "left");
        return;
    }

    if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusPane("left");
        return;
    }

    if (e.key === "ArrowRight") {
        e.preventDefault();
        focusPane("right");
        return;
    }

    if (e.key === "Escape") {
        e.preventDefault();
        if (paneMode === "search" && handleSearchPaneEscape()) return;
        if ((paneMode === "browse" || paneMode === "home") && paneDrilledDown) {
            clearPaneRight();
            return;
        }
        closePanes();
        return;
    }

    // Queue works from either pane whenever a track is selected on the right.
    if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        queueSelectedPaneTrack();
        return;
    }

    // Like / unlike focused pane selection (track on the right, album/playlist on the left).
    if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        await handleLibraryLike(true, { toggle: true });
        return;
    }
    if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        await handleLibraryLike(false, { toggle: false });
        return;
    }

    if (paneFocus === "left") {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!paneLeftItems.length) return;
            const delta = e.key === "ArrowDown" ? 1 : -1;
            let next = popupSelected;
            for (let step = 0; step < paneLeftItems.length; step += 1) {
                next = (next + delta + paneLeftItems.length) % paneLeftItems.length;
                if (
                    (paneMode !== "home" && paneMode !== "search") ||
                    paneLeftItems[next]?.kind !== "header"
                ) {
                    break;
                }
            }
            popupSelected = next;
            selectPaneRow("left", popupSelected);
            if (paneMode === "browse") schedulePlaylistPreview();
            if (paneMode === "home") scheduleHomePreview();
            if (paneMode === "search") scheduleSearchPreview();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (paneMode === "home" || paneMode === "search") {
                clearTimeout(panePreviewTimer);
                const item = paneLeftItems[popupSelected];
                const openItem =
                    paneMode === "search" ? loadSearchItemIntoPane : loadHomeItemIntoPane;
                if (item?.kind === "header") {
                    const next = paneLeftItems.findIndex(
                        (row, index) => index > popupSelected && row.kind !== "header" && row.uri
                    );
                    if (next >= 0) {
                        popupSelected = next;
                        renderPanes();
                        await openItem(paneLeftItems[popupSelected], {
                            play: true,
                            focusRight: true,
                        });
                    }
                    return;
                }
                if (item) await openItem(item, { play: true, focusRight: true });
                return;
            }
            if (paneMode !== "browse") {
                focusPane("right");
                return;
            }
            clearTimeout(panePreviewTimer);
            const playlist = paneLeftItems[popupSelected];
            if (playlist) await loadPlaylistTracksIntoPane(playlist, { play: true, focusRight: true });
            return;
        }

        if ((e.key === "n" || e.key === "N") && paneMode === "browse") {
            e.preventDefault();
            popupMode = "new";
            renderPopup();
        }
        return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!popupTracks.length) return;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        popupTrackSelected = (popupTrackSelected + delta + popupTracks.length) % popupTracks.length;
        selectPaneRow("right", popupTrackSelected);
        return;
    }

    if (e.key === "Enter") {
        e.preventDefault();
        const track = popupTracks[popupTrackSelected];
        if (track?.uri) {
            playerPlayUri(track.uri, popupTrackContext || undefined);
            print("Playing: " + track.name);
        }
    }
}

function mountPopup() {
    const host = document.getElementById("spotui-tui") || document.body;
    host.appendChild(popup);
}

function closePopup() {
    if (popup) {
        popup.remove();
        popup = null;
    }
    popupMode = null;
    popupCustomEditing = false;
    popupCustomReturnToPicker = false;
    popupCustomDraft = null;
    popupFontCustomEditing = false;
    if (paneMode) {
        focusPane(paneFocus);
        return;
    }
    const input = document.getElementById("spotui-input");
    if (input) input.focus();
}

function renderPopup() {
    if (popup) popup.remove();
    popup = document.createElement("div");
    popup.id = "spotui-popup";
    popup.tabIndex = 0;

    if (popupMode === "new") {
        popup.innerHTML = `<div class="popup-title">New playlist name &mdash; Enter confirm &middot; Esc cancel</div><input id="popup-input" class="popup-input">`;
        mountPopup();
        const inputEl = popup.querySelector("#popup-input");
        inputEl.focus();
        inputEl.addEventListener("keydown", handleNewKeydown);
    } else if (popupMode === "themes") {
        popup.innerHTML = `<div class="popup-title">Theme &mdash; &uarr;/&darr; preview &middot; Enter keep &middot; c customize &middot; a follow Spicetify &middot; Esc cancel</div><div id="popup-list"></div>`;
        mountPopup();
        const listEl = popup.querySelector("#popup-list");
        getAllSchemes().forEach((scheme, idx) => {
            const row = document.createElement("div");
            row.className = "popup-row" + (idx === popupSchemeSelected ? " selected" : "");

            const swatch = document.createElement("span");
            swatch.className = "popup-swatch";
            swatch.style.background = scheme.accent;

            const label = document.createElement("span");
            label.textContent = `${idx + 1}. ${scheme.label}${scheme.id === popupSchemeOriginal ? " (current)" : ""}`;

            row.append(swatch, label);
            listEl.appendChild(row);
        });
        popup.addEventListener("keydown", handleThemeKeydown);
        popup.focus();
        scrollSelectedPopupRowIntoView();
    } else if (popupMode === "theme-custom") {
        popup.classList.add("theme-custom-popup");
        const title = popupCustomEditing
            ? `Custom color &mdash; type #hex or r g b &middot; Enter apply &middot; Esc back`
            : `Custom theme &mdash; &uarr;/&darr; select &middot; Enter edit &middot; s save &middot; r reset &middot; Esc cancel`;
        popup.innerHTML = `<div class="popup-title">${title}</div><div id="popup-list"></div>`;
        mountPopup();
        const listEl = popup.querySelector("#popup-list");
        const draft = popupCustomDraft || readCustomScheme();

        CUSTOM_THEME_TOKENS.forEach((token, idx) => {
            const row = document.createElement("div");
            row.className = "popup-row" + (idx === popupCustomSelected ? " selected" : "");

            if (token === "font") {
                const tokenLabel = document.createElement("span");
                tokenLabel.className = "popup-row-token";
                tokenLabel.textContent = SCHEME_TOKEN_LABELS[token];

                const value = document.createElement("span");
                value.className = "popup-row-hex";
                value.textContent = draft.font;
                value.style.fontFamily = fontFamilyValue(draft.font);

                row.append(tokenLabel, value);
                listEl.appendChild(row);
            } else if (popupCustomEditing && idx === popupCustomSelected) {
                const swatch = document.createElement("span");
                swatch.className = "popup-swatch";
                swatch.style.background = draft[token];

                const tokenLabel = document.createElement("span");
                tokenLabel.className = "popup-row-token";
                tokenLabel.textContent = SCHEME_TOKEN_LABELS[token];

                const input = document.createElement("input");
                input.id = "popup-input";
                input.className = "popup-input";
                input.value = draft[token];
                input.setAttribute("spellcheck", "false");
                input.style.marginTop = "6px";

                row.append(swatch, tokenLabel);
                listEl.appendChild(row);
                listEl.appendChild(input);
            } else {
                const swatch = document.createElement("span");
                swatch.className = "popup-swatch";
                swatch.style.background = draft[token];

                const tokenLabel = document.createElement("span");
                tokenLabel.className = "popup-row-token";
                tokenLabel.textContent = SCHEME_TOKEN_LABELS[token];

                const hex = document.createElement("span");
                hex.className = "popup-row-hex";
                hex.textContent = draft[token];

                row.append(swatch, tokenLabel, hex);
                listEl.appendChild(row);
            }
        });

        if (popupCustomEditing) {
            const inputEl = popup.querySelector("#popup-input");
            inputEl.focus();
            inputEl.select();
            inputEl.addEventListener("keydown", handleCustomThemeEditKeydown);
            inputEl.addEventListener("input", () => {
                const parsed = parseColor(inputEl.value);
                if (!parsed) return;
                const token = SCHEME_COLOR_TOKENS[popupCustomSelected];
                popupCustomDraft = cloneScheme(popupCustomDraft);
                popupCustomDraft[token] = rgbToHex(parsed);
                previewSchemeColors(popupCustomDraft);
                const swatch = popup.querySelector(".popup-row.selected .popup-swatch");
                if (swatch) swatch.style.background = popupCustomDraft[token];
            });
        } else {
            popup.addEventListener("keydown", handleCustomThemeKeydown);
            popup.focus();
            scrollSelectedPopupRowIntoView();
        }
    } else if (popupMode === "theme-fonts") {
        popup.classList.add("theme-custom-popup");
        const customFont = normalizeFontName(popupCustomDraft?.font);
        const title = popupFontCustomEditing
            ? `Custom font &mdash; type an installed font name &middot; Enter apply &middot; Esc back`
            : `Font &mdash; arrows preview &middot; Enter choose &middot; Esc back`;
        popup.innerHTML = `<div class="popup-title">${title}</div>`;
        mountPopup();

        if (popupFontCustomEditing) {
            const input = document.createElement("input");
            input.id = "popup-input";
            input.className = "popup-input";
            input.value = customFont;
            input.setAttribute("spellcheck", "false");
            input.style.fontFamily = fontFamilyValue(customFont);
            popup.appendChild(input);
            input.focus();
            input.select();
            input.addEventListener("input", () => {
                const font = normalizeFontName(input.value);
                input.style.fontFamily = fontFamilyValue(font);
                popupCustomDraft = cloneScheme(popupCustomDraft);
                popupCustomDraft.font = font;
                previewSchemeColors(popupCustomDraft);
            });
            input.addEventListener("keydown", handleCustomFontEditKeydown);
        } else {
            const grid = document.createElement("div");
            grid.className = "popup-font-grid";
            const fonts = [...SPOTUI_FONTS, "Custom…"];
            fonts.forEach((font, idx) => {
                const option = document.createElement("div");
                option.className =
                    "popup-font-option" + (idx === popupFontSelected ? " selected" : "");
                option.textContent = font;
                if (idx < SPOTUI_FONTS.length) {
                    option.style.fontFamily = fontFamilyValue(font);
                }
                grid.appendChild(option);
            });
            popup.appendChild(grid);
            popup.addEventListener("keydown", handleThemeFontKeydown);
            popup.focus();
            scrollSelectedPopupRowIntoView();
        }
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
        mountPopup();

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
    } else if (popupMode === "update") {
        const info = pendingUpdate || { version: "?", notes: "" };
        popup.classList.add("theme-custom-popup");
        popup.innerHTML = "";
        const titleEl = document.createElement("div");
        titleEl.className = "popup-title";
        titleEl.textContent = `Update available — v${info.version} · Enter update · Esc later`;
        popup.appendChild(titleEl);

        const meta = document.createElement("div");
        meta.className = "popup-update-meta";
        meta.textContent = `Current: v${SPOTUI_VERSION} → New: v${info.version}`;
        popup.appendChild(meta);

        const notes = document.createElement("div");
        notes.className = "popup-update-notes";
        notes.textContent = info.notes || "Bug fixes and improvements";
        popup.appendChild(notes);

        const actions = document.createElement("div");
        actions.className = "popup-actions";

        const updateBtn = document.createElement("button");
        updateBtn.type = "button";
        updateBtn.className = "popup-btn";
        updateBtn.textContent = "Update";
        updateBtn.addEventListener("click", () => {
            applySpotuiUpdate(info);
        });

        const laterBtn = document.createElement("button");
        laterBtn.type = "button";
        laterBtn.className = "popup-btn secondary";
        laterBtn.textContent = "Later";
        laterBtn.addEventListener("click", () => {
            updateSessionQuiet = true;
            closePopup();
            print(`Update v${info.version} postponed — type update anytime`);
        });

        actions.append(updateBtn, laterBtn);
        popup.appendChild(actions);
        mountPopup();
        popup.addEventListener("keydown", handleUpdateKeydown);
        updateBtn.focus();
    }
}

function handleUpdateKeydown(e) {
    if (e.target?.tagName === "BUTTON") return;
    if (e.key === "Enter") {
        e.preventDefault();
        applySpotuiUpdate(pendingUpdate);
    } else if (e.key === "Escape") {
        e.preventDefault();
        updateSessionQuiet = true;
        closePopup();
        if (pendingUpdate?.version) {
            print(`Update v${pendingUpdate.version} postponed — type update anytime`);
        }
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

function handleThemeKeydown(e) {
    const schemes = getAllSchemes();

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        popupSchemeSelected = (popupSchemeSelected + delta + schemes.length) % schemes.length;
        applyScheme(schemes[popupSchemeSelected].id);
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        const scheme = schemes[popupSchemeSelected];
        applyScheme(scheme.id);
        storeScheme(scheme.id);
        closePopup();
        print(`Theme: ${scheme.label}`);
    } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        openCustomThemePopup({
            seed: schemes[popupSchemeSelected],
            returnToPicker: true,
        });
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

function handleCustomThemeKeydown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        popupCustomSelected =
            (popupCustomSelected + delta + CUSTOM_THEME_TOKENS.length) % CUSTOM_THEME_TOKENS.length;
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (CUSTOM_THEME_TOKENS[popupCustomSelected] === "font") {
            openThemeFontPopup();
            return;
        }
        popupCustomEditing = true;
        renderPopup();
    } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        const saved = storeCustomScheme(popupCustomDraft);
        applyScheme(CUSTOM_SCHEME_ID);
        storeScheme(CUSTOM_SCHEME_ID);
        popupCustomEditing = false;
        popupCustomReturnToPicker = false;
        closePopup();
        print(`Theme: Custom saved (${saved.accent})`);
    } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        popupCustomDraft = cloneScheme(DEFAULT_CUSTOM_SCHEME);
        previewSchemeColors(popupCustomDraft);
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupCustomEditing = false;
        if (popupCustomReturnToPicker) {
            popupMode = "themes";
            const schemes = getAllSchemes();
            applyScheme(schemes[popupSchemeSelected]?.id || popupCustomRestoreId);
            renderPopup();
            return;
        }
        applyScheme(popupCustomRestoreId);
        closePopup();
    }
    scrollSelectedPopupRowIntoView();
}

function handleThemeFontKeydown(e) {
    const total = SPOTUI_FONTS.length + 1;
    const columns = 4;
    let delta = 0;

    if (e.key === "ArrowLeft") delta = -1;
    else if (e.key === "ArrowRight") delta = 1;
    else if (e.key === "ArrowUp") delta = -columns;
    else if (e.key === "ArrowDown") delta = columns;

    if (delta) {
        e.preventDefault();
        popupFontSelected = (popupFontSelected + delta + total) % total;
        if (popupFontSelected < SPOTUI_FONTS.length) {
            popupCustomDraft = cloneScheme(popupCustomDraft);
            popupCustomDraft.font = SPOTUI_FONTS[popupFontSelected];
            previewSchemeColors(popupCustomDraft);
        }
        renderPopup();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (popupFontSelected === SPOTUI_FONTS.length) {
            popupFontCustomEditing = true;
            renderPopup();
            return;
        }
        popupCustomDraft = cloneScheme(popupCustomDraft);
        popupCustomDraft.font = SPOTUI_FONTS[popupFontSelected];
        previewSchemeColors(popupCustomDraft);
        popupMode = "theme-custom";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupMode = "theme-custom";
        previewSchemeColors(popupCustomDraft);
        renderPopup();
    }
}

function handleCustomFontEditKeydown(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const font = normalizeFontName(e.target.value);
        popupCustomDraft = cloneScheme(popupCustomDraft);
        popupCustomDraft.font = font;
        previewSchemeColors(popupCustomDraft);
        popupFontCustomEditing = false;
        popupMode = "theme-custom";
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupFontCustomEditing = false;
        popupMode = "theme-fonts";
        renderPopup();
    }
}

function handleCustomThemeEditKeydown(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        const token = SCHEME_COLOR_TOKENS[popupCustomSelected];
        const value = e.target.value.trim();
        const parsed = parseColor(value);
        if (!parsed) {
            print(`Invalid color "${value}". Use #rrggbb or r g b`, "error");
            return;
        }
        popupCustomDraft = cloneScheme(popupCustomDraft);
        popupCustomDraft[token] = rgbToHex(parsed);
        previewSchemeColors(popupCustomDraft);
        popupCustomEditing = false;
        renderPopup();
    } else if (e.key === "Escape") {
        e.preventDefault();
        popupCustomEditing = false;
        previewSchemeColors(popupCustomDraft);
        renderPopup();
    }
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
        paneLeftItems = playlists.slice();
        popupSelected = 0;
        closePopup();
        if (paneMode === "browse") {
            renderPanes();
            focusPane("left");
        } else {
            openPanes("browse", "left");
        }
    } else if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
    }
}

injectStyle();
applyScheme(readStoredScheme());
restoreBackdrop();
restorePlayerBar();
setTimeout(createCopyButton, 500);
setTimeout(initLyricsBridge, 1000);
setTimeout(bootUpdateCheck, 2000);

// Spotify's own stylesheet may land after ours, so re-read the scheme once it settles.
setTimeout(() => applyScheme(activeSchemeId), 1500);

waitForSpotui(createTerminal);

})();
