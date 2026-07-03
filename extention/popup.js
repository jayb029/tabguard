const protectButton = document.querySelector("#protectButton");
const disableButton = document.querySelector("#disableButton");
const statusText = document.querySelector("#statusText");
const note = document.querySelector("#note");

let activeTabId = null;

async function sendToBackground(message) {
  return chrome.runtime.sendMessage(message);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab;
}

function setControls({ protected: isProtected, available = true, message }) {
  protectButton.disabled = !available || isProtected;
  disableButton.disabled = !available || !isProtected;
  statusText.textContent = message || (isProtected ? "This tab is protected." : "This tab is not protected.");
}

async function refreshStatus() {
  const tab = await getActiveTab();
  activeTabId = tab && tab.id;

  if (!activeTabId) {
    setControls({
      protected: false,
      available: false,
      message: "No active tab found."
    });
    return;
  }

  const response = await sendToBackground({
    type: "TABGUARD_GET_STATUS",
    tabId: activeTabId
  });

  if (!response.ok) {
    setControls({
      protected: false,
      available: false,
      message: response.error || "Tabguard cannot inspect this tab."
    });
    return;
  }

  setControls({
    protected: response.protected
  });
}

async function setProtection(enabled) {
  if (!activeTabId) {
    return;
  }

  setControls({
    protected: enabled,
    available: false,
    message: enabled ? "Protecting this tab..." : "Disabling protection..."
  });

  const response = await sendToBackground({
    type: enabled ? "TABGUARD_ENABLE" : "TABGUARD_DISABLE",
    tabId: activeTabId
  });

  if (!response.ok) {
    setControls({
      protected: false,
      available: true,
      message: response.error || "Tabguard could not update this tab."
    });
    note.textContent = "This usually happens on browser pages, the Chrome Web Store, or restricted URLs.";
    return;
  }

  setControls({
    protected: response.protected
  });
}

protectButton.addEventListener("click", () => {
  setProtection(true);
});

disableButton.addEventListener("click", () => {
  setProtection(false);
});

refreshStatus().catch((error) => {
  setControls({
    protected: false,
    available: false,
    message: error.message
  });
});
