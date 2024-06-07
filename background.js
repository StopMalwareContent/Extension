// StopMalwareContent's Source Code for Firefox extension
// Inspired from https://github.com/StopModReposts/Extension
const API_URL = "https://smc.ldne.xyz/sites.json"
let cachedSites = []
let ignoreList = []
let lastBlockedSite = {
  domain: "",
  reason: "",
  notes: "",
  path: "",
  url: "",
}

refreshCache()

function refreshCache() {
  fetch(API_URL)
    .then((response) => response.json())
    .then((response) => {
      cachedSites = response
    })
}

// some complex code
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "get-blocked-site") {
    return sendResponse(lastBlockedSite)
  }
  if (message.type === "add-to-ignore") {
    ignoreList.push(lastBlockedSite.domain)
    console.log(ignoreList)
    return sendResponse(null)
  }
})

let lastNavUrl = ""
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // if url is empty -> skip
  if (!tab.url) return
  // if url have not changes -> skip
  if (lastNavUrl == tab.url) return
  // making url real URL
  const parsed = new URL(tab.url)
  // getting domain from URL
  const host = parsed.host
  // we will need that for future
  lastNavUrl = tab.url

  // checking if site is flagged!
  const site = cachedSites.find(
    (site) => site.domain === host || parsed.host.endsWith(`.${site.domain}`)
  )

  if (!site) return

  // user said he does not cares?
  const isIgnored = ignoreList.includes(site.domain)
  // then we -> skip
  if (isIgnored) return
  // check if domain's path is being blocked
  const pathCorrect = site.path ? parsed.pathname.startsWith(site.path) : true
  if (!pathCorrect) return
  // we're setting this variables so alert.html page will know site's domain, reason and url
  lastBlockedSite.domain = site.domain
  lastBlockedSite.reason = site.reason
  lastBlockedSite.notes = site.notes
  lastBlockedSite.path = site.path
  lastBlockedSite.url = tab.url

  chrome.tabs.update({
    url: chrome.runtime.getURL(`/html/alert.html`),
  })
})
