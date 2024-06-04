// StopMalwareContent's Source Code for Firefox extension
// Inspired from https://github.com/StopModReposts/Extension
const API_URL = "https://stopmalwarecontent-api.onrender.com/sites.json"
let cachedSites = []
let ignoreList = []
let lastBlockedSiteDomain = ""
let lastBlockedSiteReason = ""
let lastBlockedUrl = ""

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
  if (message.type === "get-blocked-domain") {
    return sendResponse(lastBlockedSiteDomain)
  }
  if (message.type === "get-blocked-reason") {
    return sendResponse(lastBlockedSiteReason)
  }
  if (message.type === "get-blocked-url") {
    return sendResponse(lastBlockedUrl)
  }
  if (message.type === "add-to-ignore") {
    ignoreList.push(lastBlockedSiteDomain)
    print(ignoreList)
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
  // user said he does not cares?
  const isIgnored = ignoreList.includes(site.domain)
  // then we -> skip
  if (isIgnored) return

  // what's we gonna do if site FLAGGED
  if (site) {
    // we're setting this variables so alert.html page will know site's domain, reason and url
    lastBlockedSiteDomain = site.domain
    lastBlockedSiteReason = site.reason
    lastBlockedUrl = tab.url

    chrome.tabs.update({
      url: chrome.runtime.getURL(`/html/alert.html`),
    })
  }
})
