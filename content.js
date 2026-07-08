const STYLE_ID = 'dark-theme-extension-style';

const CSS = `
  :root {
    color-scheme: dark !important;
  }

  html, body {
    background-color: #121212 !important;
    color: #e8e8e8 !important;
  }

  /* Invert images and videos back so they look natural */
  img, video, canvas, svg image, picture {
    filter: brightness(0.9) !important;
  }

  /* Inputs and form elements */
  input, textarea, select, button {
    background-color: #1e1e1e !important;
    color: #e8e8e8 !important;
    border-color: #1e1e1e !important;
  }

  button {
    background-color: #000000 !important;
  }

  .Button {
    background: #1e1e1e !important;
    border-color: #1e1e1e !important;
  }

  .toggle_comments_link {
    border-color: #1e1e1e !important;
  }

  .toggle_rubric_assessments_link {
    border-color: #1e1e1e !important;
  }

  .toggle_score_details_link {
    border-color: #1e1e1e !important;
  }

  .status {
    background: #1e1e1e !important;
    color: #e8e8e8 !important;
  }

  .grade {
    border-width: 0px
  }

  .show_guess_grades_link {
    background-color: #1e1e1e !important;
  }

  /* Links */
  a {
    color: #37ff00ff !important;
  }

  a:visited {
    color: #e3ffb5ff !important;
  }

  /* Common container elements */
  div, section, article, aside, header, footer, main, nav,
  table, thead, tbody, tr, th, td,
  ul, ol, li,
  h1, h2, h3, h4, h5, h6,
  p, span, label, blockquote, pre, code {
    background-color: inherit !important;
    color: inherit !important;
    border-color: #1e1e1e !important;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    background-color: #1a1a1a !important;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #444 !important;
    border-radius: 4px !important;
  }

  /* Override white/light backgrounds explicitly set inline or by class */
  [style*="background: white"],
  [style*="background-color: white"],
  [style*="background: #fff"],
  [style*="background-color: #fff"],
  [style*="background: #ffffff"],
  [style*="background-color: #ffffff"] {
    background-color: #1a1a1a !important;
    color: #e8e8e8 !important;
  }

  /* Shadows / cards */
  [class*="card"], [class*="panel"], [class*="modal"], [class*="dialog"],
  [class*="dropdown"], [class*="menu"], [class*="tooltip"] {
    background-color: #1e1e1e !important;
    color: #e8e8e8 !important;
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
