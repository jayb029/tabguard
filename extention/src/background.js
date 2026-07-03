const PROTECTED_TABS_KEY = "protectedTabIds";

function normalizeTabId(tabId) {
  const numericTabId = Number(tabId);

  if (!Number.isInteger(numericTabId) || numericTabId < 0) {
    throw new Error("Invalid tab.");
  }

  return numericTabId;
}

async function getProtectedTabIds() {
  const result = await chrome.storage.session.get(PROTECTED_TABS_KEY);
  return Array.isArray(result[PROTECTED_TABS_KEY]) ? result[PROTECTED_TABS_KEY] : [];
}

async function isProtected(tabId) {
  const protectedTabIds = await getProtectedTabIds();
  return protectedTabIds.includes(tabId);
}

async function setProtected(tabId, enabled) {
  const protectedTabIds = await getProtectedTabIds();
  const nextTabIds = enabled
    ? Array.from(new Set([...protectedTabIds, tabId]))
    : protectedTabIds.filter((protectedTabId) => protectedTabId !== tabId);

  await chrome.storage.session.set({
    [PROTECTED_TABS_KEY]: nextTabIds
  });
}

async function sendTabMessage(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    if (message.type === "TABGUARD_DISABLE") {
      return;
    }

    throw error;
  }
}

async function enableTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/content.js"]
  });
  await setProtected(tabId, true);
  return { ok: true, protected: true };
}

async function disableTab(tabId) {
  await sendTabMessage(tabId, { type: "TABGUARD_DISABLE" });
  await setProtected(tabId, false);
  return { ok: true, protected: false };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  async function handleMessage() {
    const tabId = normalizeTabId(message.tabId);

    if (message.type === "TABGUARD_GET_STATUS") {
      return {
        ok: true,
        protected: await isProtected(tabId)
      };
    }

    if (message.type === "TABGUARD_ENABLE") {
      return enableTab(tabId);
    }

    if (message.type === "TABGUARD_DISABLE") {
      return disableTab(tabId);
    }

    throw new Error("Unknown Tabguard command.");
  }

  handleMessage()
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error.message || "Tabguard could not update this tab."
      });
    });

  return true;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const protectedTabIds = await getProtectedTabIds();
  const nextTabIds = protectedTabIds.filter((protectedTabId) => protectedTabId !== tabId);

  if (nextTabIds.length !== protectedTabIds.length) {
    await chrome.storage.session.set({
      [PROTECTED_TABS_KEY]: nextTabIds
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  isProtected(tabId).then((tabIsProtected) => {
    if (tabIsProtected) {
      enableTab(tabId).catch(() => setProtected(tabId, false));
    }
  });
});
