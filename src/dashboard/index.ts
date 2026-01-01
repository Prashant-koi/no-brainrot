import './dashboard.css';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { DailyStats } from '../types/types';

Chart.register(ArcElement, Tooltip, Legend, PieController);

const app = document.getElementById("app")!;

app.innerHTML = `
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">No Brainrot Dashboard</h1>
    
    <div class="stats-card mb-6">
      <h2 class="text-xl font-semibold mb-4">Today's Activity</h2>
      <div class="total-time-card">
        <div class="text-sm text-zinc-400">Total Social Media Time</div>
        <div id="total-time" class="text-4xl font-bold text-green-400 mt-2">0m</div>
      </div>
    </div>

    <div class="stats-card">
      <h2 class="text-xl font-semibold mb-4">Time by Platform</h2>
      <div class="chart-container">
        <canvas id="pieChart"></canvas>
      </div>
    </div>

    <button id="refresh" class="refresh-btn mt-6">
      Refresh Data
    </button>
  </div>
`;

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

const platformColors: Record<string, string> = {
  'YouTube': '#FF0000',
  'YoutubeMusic': '#dda712ff',
  'Instagram': '#ea6fc1ff',
  'Facebook': '#1877F2',
  'TikTok': '#000000',
};

let pieChart: Chart | null = null;

async function loadData() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' });
  const stats: DailyStats | null = response;

  const totalTimeEl = document.getElementById('total-time');
  if (!totalTimeEl) return;

  if (!stats || Object.keys(stats.totalByPlatform).length === 0) {
    totalTimeEl.textContent = '0m';
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    }
    return;
  }

  
  const totalMs = Object.values(stats.totalByPlatform).reduce((sum, time) => sum + time, 0);
  totalTimeEl.textContent = formatTime(totalMs);

  
  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];

  for (const [platform, timeMs] of Object.entries(stats.totalByPlatform)) {
    if (platform === 'Other') continue;
    labels.push(platform);
    data.push(Math.round(timeMs / 1000 / 60)); // to mins
    colors.push(platformColors[platform] || '#888888');
  }

  // Create or update chart
  const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
  if (!ctx) return;

  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#1a1a1a',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 20,
            font: {
              size: 14,
              family: 'system-ui, -apple-system, sans-serif',
            },
          },
        },
        tooltip: {
          backgroundColor: '#2a2a2a',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4ade80',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
              return `${label}: ${timeStr}`;
            },
          },
        },
      },
    },
  });
}

document.getElementById("refresh")?.addEventListener("click", () => {
  loadData();
});

loadData();

// 60 sec referesh
setInterval(loadData, 60000);
