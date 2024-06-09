let blockedSite = {
  domain: "",
  reason: "",
  notes: "",
  path: "",
  url: "",
}
let preferedLanguage = navigator.language.split("-")[0]

fetch("./locales.json")
  .then((response) => response.json())
  .then((data) => {
    if (data[preferedLanguage]) {
      document.getElementById("translated-alert").innerHTML =
        data[preferedLanguage].title
      document.getElementById("translated-description").innerHTML =
        data[preferedLanguage].description
      document.getElementById("translated-blocked").innerText =
        data[preferedLanguage].blocked
      document.getElementById("translated-reason").innerText =
        data[preferedLanguage].reason
      document.getElementById("translated-notes").innerText =
        data[preferedLanguage].notes
      document.getElementById("ignore").innerText =
        data[preferedLanguage].accept_the_risk
      document.getElementById("back").innerText =
        data[preferedLanguage].back_to_safety
    }
  })
  .catch((error) => console.log(error))

chrome.runtime.sendMessage({ type: "get-blocked-site" }, (response) => {
  blockedSite = response
  document.getElementById("domain").innerText = blockedSite.domain
  document.getElementById("reason").innerText = blockedSite.reason
  document.getElementById("notes").innerText = blockedSite.notes
  if (blockedSite.path.length > 1)
    document.getElementById("path").innerText = blockedSite.path
})

document.getElementById("ignore").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "add-to-ignore" })
  chrome.tabs.update({
    url: blockedSite.url,
  })
})

document
  .getElementById("back")
  .addEventListener("click", () => window.history.go(-2))
