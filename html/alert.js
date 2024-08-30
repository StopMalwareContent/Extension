let blockedSite = {
  domain: "",
  reason: "",
  notes: "",
  path: "",
  url: "",
};
let preferedLanguage = navigator.language.replace("-", "_");

fetch(`./i18n/${preferedLanguage}.json`)
  .then((response) => response.json())
  .then((data) => {
    var elements = document.getElementsByTagName("*");

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      let translateKey = element.getAttribute("translate-key");
      if (translateKey) {
        element.innerHTML = data[translateKey];
      }
    }
  })
  .catch((error) => console.log(error));

chrome.runtime.sendMessage({ type: "get-blocked-site" }, (response) => {
  blockedSite = response;
  document.getElementById("domain").innerText = blockedSite.domain;
  document.getElementById("reason").innerText = blockedSite.reason;
  document.getElementById("notes").innerText = blockedSite.notes;
  if (blockedSite.path.length > 1)
    document.getElementById("path").innerText = blockedSite.path;
});

document.getElementById("ignore").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "add-to-ignore" });
  chrome.tabs.update({
    url: blockedSite.url,
  });
});

document
  .getElementById("back")
  .addEventListener("click", () => window.history.go(-2));
