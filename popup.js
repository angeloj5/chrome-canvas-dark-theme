const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

function setStatus(enabled) {
  if (enabled) {
    status.textContent = 'Dark theme is ON';
    status.className = 'status on';
  } else {
    status.textContent = 'Dark theme is OFF';
    status.className = 'status';
  }
}

// Load current state
chrome.storage.local.get(['darkEnabled'], (result) => {
  const enabled = result.darkEnabled !== false;
  toggle.checked = enabled;
  setStatus(enabled);
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ darkEnabled: enabled });
  setStatus(enabled);

  // Send message to the active tab's content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: enabled ? 'enable' : 'disable',
    }).catch(() => {
      // Tab may not have the content script yet; reload will pick up the stored state
    });
  });
});
