# Dark Theme — Chrome Extension

A lightweight Chrome extension that applies a dark theme to any web page.

## Features

- Dark theme applied automatically to every page on install
- Toggle on/off per-tab via the toolbar popup
- Preference persists across browser sessions
- Dims images slightly to avoid blowout
- Injects into same-origin iframes
- MutationObserver re-applies styles to dynamically added iframes

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this project folder

The moon icon will appear in your toolbar. Click it to toggle the dark theme on or off.

## File Structure

```
chrome-canvas-dark-theme/
├── manifest.json      # Manifest V3 extension config
├── content.js         # Injects dark CSS into pages
├── popup.html         # Toolbar popup UI
├── popup.js           # Toggle logic and storage
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## How It Works

`content.js` runs at `document_start` on every page. It reads the enabled state from `chrome.storage.local` and, if enabled, injects a `<style>` tag with CSS rules that:

- Set `color-scheme: dark` so native browser controls (scrollbars, date pickers, etc.) render in dark mode
- Override background colors to `#121212` and text to `#e8e8e8`
- Apply reduced brightness to images and videos so they look natural
- Style form inputs, buttons, links, cards, modals, and dropdowns

The popup toggle writes the new state to `chrome.storage.local` and sends a message to the active tab's content script for an immediate, no-reload update.

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Send messages to the current tab |
| `storage` | Persist the enabled/disabled preference |
| `scripting` | Reserved for future programmatic injection |
| `<all_urls>` | Inject the content script on every site |
