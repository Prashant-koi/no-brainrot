import { Chart, ArcElement, Tooltip, Legend, PieController, BarController, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { DailyStats, Tab } from '../../types/types';

Chart.register(ArcElement, Tooltip, Legend, PieController, BarController, CategoryScale, LinearScale, BarElement);

export class HomeTab implements Tab {
  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;
  private historyStats: DailyStats[] = [];
  private currentHistoryPage = 0; // 0 = oldest chunk, last = latest chunk
  private readonly pageSize = 10;

  private platformColors: Record<string, string> = {
    'YouTube': '#FF0000',
    'YoutubeMusic': '#dda712ff',
    'Instagram': '#ea6fc1ff',
    'Facebook': '#1877F2',
    'TikTok': '#000000',
  };

  render(): string {
    return `
      <div class="tab-content">
        <h1 class="text-3xl font-bold mb-8">Home</h1>
        
        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Today's Activity</h2>
          <div class="total-time-card">
            <div class="text-sm text-zinc-400">Total Social Media Time</div>
            <div id="total-time" class="text-4xl font-bold text-green-400 mt-2">0m</div>
          </div>
        </div>

        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Time by Platform (Today)</h2>
          <div class="chart-container">
            <canvas id="pieChart"></canvas>
          </div>
        </div>

        <div class="stats-card">
          <h2 class="text-xl font-semibold mb-4">Last 30 Days</h2>
          <div class="chart-container">
            <canvas id="barChart"></canvas>
          </div>
          <div class="chart-pagination" style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
            <button class="page-btn" data-page="0" style="padding:6px 10px; background:#3f3f46; color:#e4e4e7; border:1px solid #52525b; border-radius:6px;">1</button>
            <button class="page-btn" data-page="1" style="padding:6px 10px; background:#3f3f46; color:#e4e4e7; border:1px solid #52525b; border-radius:6px;">2</button>
            <button class="page-btn" data-page="2" style="padding:6px 10px; background:#3f3f46; color:#e4e4e7; border:1px solid #52525b; border-radius:6px;">3</button>
          </div>
        </div>

        <button id="refresh" class="refresh-btn mt-6">
          Refresh Data
        </button>
      </div>
    `;
  }

  async mount(): Promise<void> {
    await this.loadData();
    await this.loadHistory();

    document.getElementById('refresh')?.addEventListener('click', () => {
      this.loadData();
      this.loadHistory();
    });

    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = Number((e.currentTarget as HTMLElement).dataset.page);
        this.setHistoryPage(page);
      });
    });

    // Auto-refresh every 60 seconds
    setInterval(() => {
      this.loadData();
      this.loadHistory();
    }, 60000);
  }

  unmount(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  private async loadData(): Promise<void> {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' });
    const stats: DailyStats | null = response;

    const totalTimeEl = document.getElementById('total-time');
    if (!totalTimeEl) return;

    if (!stats || Object.keys(stats.totalByPlatform).length === 0) {
      totalTimeEl.textContent = '0m';
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }
      return;
    }

    const totalMs = Object.values(stats.totalByPlatform).reduce((sum, time) => sum + time, 0);
    totalTimeEl.textContent = this.formatTime(totalMs);

    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    for (const [platform, timeMs] of Object.entries(stats.totalByPlatform)) {
      if (platform === 'Other') continue;
      labels.push(platform);
      data.push(Math.round(timeMs / 1000 / 60));
      colors.push(this.platformColors[platform] || '#888888');
    }

    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart(ctx, {
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



  private async loadHistory(): Promise<void> {
    const response = await chrome.runtime.sendMessage({ type: 'GET_LAST_30_DAYS' });
    this.historyStats = response || [];

    const totalPages = this.getTotalPages();
    // default to latest page
    this.currentHistoryPage = Math.max(0, totalPages - 1);
    this.renderHistoryPage();
  }

  private setHistoryPage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page < 0 || page >= totalPages) return;
    this.currentHistoryPage = page;
    this.renderHistoryPage();
  }

  private getTotalPages(): number {
    return Math.max(1, Math.ceil(this.historyStats.length / this.pageSize));
  }

  private renderHistoryPage(): void {
    const totalPages = this.getTotalPages();
    const pageFromEnd = totalPages - 1 - this.currentHistoryPage; // page 0 oldest, last = latest
    const end = this.historyStats.length - pageFromEnd * this.pageSize;
    const start = Math.max(0, end - this.pageSize);
    const slice = this.historyStats.slice(start, end);

    const labels: string[] = [];
    const data: number[] = [];

    slice.forEach(s => {
      labels.push(s.date.slice(5));
      const totalMs = Object.values(s.totalByPlatform || {}).reduce((sum, v) => sum + v, 0);
      data.push(Math.round(totalMs / 1000 / 60)); // minutes
    });

    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Minutes per day',
          data,
          backgroundColor: '#4ade80',
          borderColor: '#16a34a',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y || 0;
                const hours = Math.floor(value / 60);
                const minutes = value % 60;
                return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#e4e4e7' }, grid: { color: '#27272a' } },
          y: { ticks: { color: '#e4e4e7' }, grid: { color: '#27272a' }, beginAtZero: true }
        }
      }
    });

    // button states for bar graph
    document.querySelectorAll<HTMLButtonElement>('.page-btn').forEach(btn => {
      const btnPage = Number(btn.dataset.page);
      const enabled = btnPage < totalPages;
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.35';
      btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
      if (btnPage === this.currentHistoryPage) {
        btn.style.borderColor = '#4ade80';
        btn.style.color = '#4ade80';
      } else {
        btn.style.borderColor = '#52525b';
        btn.style.color = '#e4e4e7';
      }
    });
  }
}