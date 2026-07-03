const demoButton = document.querySelector("#demoButton");
const demoStatus = document.querySelector("#demoStatus");

let demoProtected = false;

function beforeUnloadHandler(event) {
  event.preventDefault();
  event.returnValue = "Tabguard";
  return "Tabguard";
}

function setDemoProtection(enabled) {
  demoProtected = enabled;

  if (enabled) {
    window.addEventListener("beforeunload", beforeUnloadHandler);
    demoButton.textContent = "Disable demo guard";
    demoStatus.textContent = "Demo is on. Chrome will ask before this page unloads.";
    return;
  }

  window.removeEventListener("beforeunload", beforeUnloadHandler);
  demoButton.textContent = "Protect this demo tab";
  demoStatus.textContent = "Demo is off. Turn it on and try reloading this page.";
}

demoButton.addEventListener("click", () => {
  setDemoProtection(!demoProtected);
});
