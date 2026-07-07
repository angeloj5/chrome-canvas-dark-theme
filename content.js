const STYLE_ID = 'dark-theme-extension-style';

const CSS = `
  :root {
    color-scheme: dark !important;
  }

  /* Universal dark base — covers every element including custom ones,
     avoiding inheritance-chain gaps that let light backgrounds leak through */
  *, *::before, *::after {
    background-color: #121212 !important;
    color: #e8e8e8 !important;
    border-color: #333 !important;
    outline-color: #555 !important;
  }

  /* Restore transparency for media and void elements */
  img, video, canvas, svg, picture, iframe,
  br, hr, wbr {
    background-color: transparent !important;
  }

  /* Images and video look natural at slightly reduced brightness */
  img, video {
    filter: brightness(0.9) !important;
    color: transparent !important;
  }

  /* Links */
  a {
    color: #8ab4f8 !important;
  }

  a:visited {
    color: #c58af9 !important;
  }

  /* Inputs */
  input, textarea, select {
    background-color: #1e1e1e !important;
    border-color: #444 !important;
  }

  /* Buttons and button-like elements (including <a role="button">) */
  button,
  [role="button"],
  input[type="button"],
  input[type="submit"],
  input[type="reset"] {
    background-color: #2a2a2a !important;
    color: #e8e8e8 !important;
    border-color: #555 !important;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    background-color: #1a1a1a !important;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #444 !important;
    border-radius: 4px !important;
  }

  /* iframes get their own injection via the content script re-running */
`;

function applyDarkTheme() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);
}

function removeDarkTheme() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

// Apply dark theme to iframes
function applyToIframes() {
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || doc.getElementById(STYLE_ID)) return;
      const style = doc.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      (doc.head || doc.documentElement)?.appendChild(style);
    } catch (_) {
      // Cross-origin iframe — can't inject
    }
  });
}

// Listen for enable/disable messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'enable') {
    applyDarkTheme();
    applyToIframes();
  } else if (msg.action === 'disable') {
    removeDarkTheme();
  } else if (msg.action === 'getState') {
    return;
  }
});

// Check stored preference and apply on load
chrome.storage.local.get(['darkEnabled'], (result) => {
  const enabled = result.darkEnabled !== false; // default ON
  if (enabled) {
    applyDarkTheme();
    // Re-apply to iframes after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyToIframes);
    } else {
      applyToIframes();
    }
  }
});

// Observe new iframes added dynamically
const observer = new MutationObserver(() => {
  chrome.storage.local.get(['darkEnabled'], (result) => {
    if (result.darkEnabled !== false) applyToIframes();
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });
