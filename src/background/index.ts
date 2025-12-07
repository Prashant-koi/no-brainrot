import { TimeTracker } from './services/TimeTracker';

console.log('[No Brainrot] Background script loaded');

const timeTracker = new TimeTracker();

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TODAY_STATS') {
    timeTracker.getTodayStats().then(sendResponse);
    return true; 
  }

  if (message.type === 'GET_ALL_STATS') {
    timeTracker.getAllStats().then(sendResponse);
    return true;
  }

  if (message.type === 'GET_STATS_FOR_DATE') {
    timeTracker.getStatsForDate(message.date).then(sendResponse);
    return true;
  }
});