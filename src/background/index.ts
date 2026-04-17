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

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;

  const initiator = (details as any).initiator || "";
  const isFromChat = chatDomains.some((d) => initiator.includes(d));

  if (isFromChat) {
    chatOpenedTabs.add(details.tabId);
  } else {
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
