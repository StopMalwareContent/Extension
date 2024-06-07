let blockedSite = {
  domain: "",
  reason: "",
  notes: "",
  path: "",
  url: "",
}

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
