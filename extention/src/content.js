(function initializeTabguard() {
  const namespace = "__TABGUARD__";

  if (window[namespace]) {
    window[namespace].enable();
    return;
  }

  function beforeUnloadHandler(event) {
    event.preventDefault();
    event.returnValue = "Tabguard";
    return "Tabguard";
  }

  function showToast(message) {
    const existingToast = document.querySelector("[data-tabguard-toast]");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.dataset.tabguardToast = "true";
    toast.textContent = message;
    toast.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483647",
      "background:#1c1b18",
      "color:#f7f5ef",
      "border:1px solid #d7d0c1",
      "border-radius:8px",
      "font:14px/1.4 Avenir Next, Avenir, Helvetica Neue, Helvetica, sans-serif",
      "max-width:300px",
      "padding:10px 12px",
      "box-shadow:0 2px 8px rgba(0,0,0,0.18)"
    ].join(";");

    document.documentElement.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3600);
  }

  window[namespace] = {
    enabled: false,
    enable() {
      if (this.enabled) {
        showToast("Tabguard is already protecting this tab.");
        return;
      }

      window.addEventListener("beforeunload", beforeUnloadHandler);
      this.enabled = true;
      showToast("Tabguard is protecting this tab. Interact with the page once before closing.");
    },
    disable() {
      if (!this.enabled) {
        return;
      }

      window.removeEventListener("beforeunload", beforeUnloadHandler);
      this.enabled = false;
      showToast("Tabguard protection is off for this tab.");
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "TABGUARD_ENABLE") {
      window[namespace].enable();
    }

    if (message.type === "TABGUARD_DISABLE") {
      window[namespace].disable();
    }
  });

  window[namespace].enable();
})();
