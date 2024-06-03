let blockedDomain = ""
let blockedReason = ""
let blockedUrl = ""

chrome.runtime.sendMessage({ type: "get-blocked-domain" }, (response) => {
  blockedDomain = response
  document.getElementById("domain").innerText = blockedDomain
})

chrome.runtime.sendMessage({ type: "get-blocked-reason" }, (response) => {
  blockedReason = response
  document.getElementById("reason").innerText = blockedReason
})

chrome.runtime.sendMessage({ type: "get-blocked-url" }, (response) => {
  blockedUrl = response
})

document.getElementById("ignore").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "add-to-ignore" })
  chrome.tabs.update({
    url: blockedUrl,
  })
})

document
  .getElementById("back")
  .addEventListener("click", () => window.history.go(-2))
