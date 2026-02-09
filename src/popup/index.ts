import { DailyStats } from "../types/types";

console.log('[No Brainrot] Popup loaded');

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

async function loadStats(): Promise<void> {
  const container = document.getElementById('stats-container');
  const totalContainer = document.getElementById('total-container');
  const totalTimeEl = document.getElementById('total-time');

  if (!container || !totalContainer || !totalTimeEl) return;

  const rawAnalytics = localStorage.getItem('analytics');
  if (rawAnalytics) {
    try {
      const analytics = JSON.parse(rawAnalytics);
      if (typeof analytics.todayMinutes === 'number') {
        totalContainer.style.display = 'block';
        totalTimeEl.textContent = `${analytics.todayMinutes}m`;
        container.innerHTML = '<p style="color: #888;">Analytics loaded from local storage.</p>';
        return;
      }
    } catch (err) {
      console.warn('[No Brainrot] Failed to parse analytics from localStorage', err);
    }
  }

  const response = await chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' });
  const stats: DailyStats | null = response;


  if (!stats || Object.keys(stats.totalByPlatform).length === 0) {
    container.innerHTML = '<p style="color: #888;">No activity today yet!</p>';
    return;
  }

  const totalMs = Object.values(stats.totalByPlatform).reduce((sum, time) => sum + time, 0);

  // platform breakdown
  container.innerHTML = '';
  for (const [platform, timeMs] of Object.entries(stats.totalByPlatform)) {
    if (platform === 'Other') continue; 

    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    statItem.innerHTML = `
      <span class="platform-name">${platform}</span>
      <span class="time">${formatTime(timeMs)}</span>
    `;
    container.appendChild(statItem);
  }

  
  totalContainer.style.display = 'block';
  totalTimeEl.textContent = formatTime(totalMs);
}

// dashboard button
document.getElementById('open-dashboard')?.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
});

loadStats();