import { TimeTracker } from "./services/TimeTracker";

console.log("[No Brainrot] Background script loaded");

const timeTracker = new TimeTracker();

// track tabs opened from chat domains
const chatOpenedTabs = new Set<number>();

const chatDomains = [
  "instagram.com",
  "messenger.com",
  "web.whatsapp.com",
  "discord.com",
  "telegram.org",
  "t.me",
];

// we need to track when a tab opens another tab (e.g., clicking a link that opens in new tab)
chrome.webNavigation.onCreatedNavigationTarget.addListener(async (details) => {
  try {
    const sourceTab = await chrome.tabs.get(details.sourceTabId);
    if (!sourceTab.url) return;

    const sourceHost = new URL(sourceTab.url).hostname;
    const isFromChat = chatDomains.some((d) => sourceHost.includes(d));

    if (isFromChat) {
      chatOpenedTabs.add(details.tabId);
      console.log(`[No Brainrot] Tab ${details.tabId} opened from chat domain: ${sourceHost}`);
    }
  } catch (e) {
    // Source tab may have closed
  }
});

// we will clear the flag when tab navigates away like when user goes there manually
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  // we only clear if it's a user-initiated navigation
  if (details.transitionType === "typed" || details.transitionType === "auto_bookmark") {
    chatOpenedTabs.delete(details.tabId);
  }
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_TODAY_STATS") {
    timeTracker.getTodayStats().then(sendResponse);
    return true;
  }

  if (message.type === "GET_ALL_STATS") {
    timeTracker.getAllStats().then(sendResponse);
    return true;
  }

  if (message.type === "GET_STATS_FOR_DATE") {
    timeTracker.getStatsForDate(message.date).then(sendResponse);
    return true;
  }

  if (message.type === "GET_LAST_30_DAYS") {
    timeTracker.getLastNDaysStats(30).then(sendResponse);
    return true;
  }

  if (message.type === "IS_FROM_CHAT") {
    sendResponse({ isFromChat: chatOpenedTabs.has(sender.tab?.id ?? -1) });
    return true;
  }
});
