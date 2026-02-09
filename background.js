const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

function openHistoryTab() {
  const url = browserAPI.runtime.getURL('history.html');
  try {
    // Works in Firefox (Promise) and Chromium (callback or no-callback)
    browserAPI.tabs.create({ url });
  } catch (e) {
    // Fallback for implementations requiring a callback
    try { browserAPI.tabs.create({ url }, () => {}); } catch (err) { /* ignore */ }
  }
}

const action = browserAPI.action || browserAPI.browserAction || browserAPI.browser_action;
if (action && action.onClicked && typeof action.onClicked.addListener === 'function') {
  action.onClicked.addListener(openHistoryTab);
}

// Handle keyboard command (Ctrl+H)
if (browserAPI.commands && typeof browserAPI.commands.onCommand.addListener === 'function') {
  browserAPI.commands.onCommand.addListener((command) => {
    if (command === 'open-history') openHistoryTab();
  });
}
