// StopMalwareContent's Source Code for Firefox extension
// Inspired from https://github.com/StopModReposts/Extension
const API_URL = "https://smc-api.lodine.xyz/sites";
const OFFLINE_COPY_URL = "data/sites.json";

let cachedSites = [];
let ignoreList = [];
let lastBlockedSite = {
  domain: "",
  reason: "",
  notes: "",
  path: "",
  url: "",
};

refreshCache();

function refreshCache() {
  fetch(API_URL)
    .then((response) => {
      if (!response.ok) throw new Error("API unreachable");
      return response.json();
    })
    .then((data) => {
      cachedSites = data;
    })
    .catch(() => {
      console.warn("Using offline copy due to API failure");
      return fetch(OFFLINE_COPY_URL)
        .then((response) => response.json())
        .then((data) => {
          cachedSites = data;
        })
        .catch(() => {
          console.error("Failed to load offline copy");
        });
    });
}

// some complex code
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "get-blocked-site") {
    return sendResponse(lastBlockedSite);
  }
  if (message.type === "add-to-ignore") {
    ignoreList.push(lastBlockedSite.domain);
    console.log(ignoreList);
    return sendResponse(null);
  }
});

let lastNavUrl = "";
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If URL is empty, skip
  if (!tab.url) return;

  // If URL has not changed, skip
  if (lastNavUrl == tab.url) return;

  // Making URL a real URL
  const parsed = new URL(tab.url);

  // Getting domain from URL
  const host = parsed.host;

  // We will need that for future
  lastNavUrl = tab.url;

  // Check if the site is flagged
  const flaggedSites = cachedSites.filter(
    (site) => site.domain === host || parsed.host.endsWith(`.${site.domain}`),
  );

  if (!flaggedSites.length) return;

  // Iterate through all flagged sites for this domain
  for (const site of flaggedSites) {
    // Check if user ignored this domain
    const isIgnored = ignoreList.includes(site.domain);
    if (isIgnored) continue;

    // Check if the path matches
    const pathCorrect = site.path
      ? parsed.pathname.startsWith(site.path)
      : true;
    if (!pathCorrect) continue;

    // Set variables so alert.html page will know site's domain, reason, and URL
    lastBlockedSite.domain = site.domain;
    lastBlockedSite.reason = site.reason;
    lastBlockedSite.notes = site.notes;
    lastBlockedSite.path = site.path;
    lastBlockedSite.url = tab.url;

    // Redirect to the alert page
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(`/html/alert.html`),
    });

    // Exit the loop as we found a match and handled it
    break;
  }
});
