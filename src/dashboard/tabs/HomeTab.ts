import type { Chart } from 'chart.js';
import { renderBarChart, renderPieChart } from './home/chartUtils';
import { getHistorySlice, getMaxTotalMs, getTotalPages, updatePaginationButtons } from './home/historyHelpers';
import { formatTime } from './home/timeUtils';
import { DailyStats, Tab } from '../../types/types';

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
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div class="total-time-card" style="flex:1; min-width:220px;">
              <div class="text-sm text-zinc-400">Total Social Media Time</div>
              <div id="total-time" class="text-4xl font-bold text-green-400 mt-2">0m</div>
            </div>
            <div class="total-time-card" style="flex:1; min-width:220px;">
              <div class="text-sm text-zinc-400">Maximum Time (Last 30 Days)</div>
              <div id="max-time" class="text-4xl font-bold text-green-400 mt-2">0m</div>
            </div>
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
    totalTimeEl.textContent = formatTime(totalMs);

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

    this.pieChart = renderPieChart(ctx, this.pieChart, { labels, data, colors });
  }



  private async loadHistory(): Promise<void> {
    const response = await chrome.runtime.sendMessage({ type: 'GET_LAST_30_DAYS' });
    this.historyStats = response || [];

    const maxMs = getMaxTotalMs(this.historyStats);
    this.setMaxTimeDisplay(maxMs);

    const totalPages = getTotalPages(this.historyStats, this.pageSize);

    this.currentHistoryPage = Math.max(0, totalPages - 1);
    this.renderHistoryPage();
  }

  private setHistoryPage(page: number): void {
    const totalPages = getTotalPages(this.historyStats, this.pageSize);
    if (page < 0 || page >= totalPages) return;
    this.currentHistoryPage = page;
    this.renderHistoryPage();
  }

  private renderHistoryPage(): void {
    const totalPages = getTotalPages(this.historyStats, this.pageSize);
    const { labels, data } = getHistorySlice(this.historyStats, this.pageSize, this.currentHistoryPage);

    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.barChart = renderBarChart(ctx, this.barChart, labels, data);
    updatePaginationButtons(this.currentHistoryPage, totalPages);
  }

  private setMaxTimeDisplay(ms: number): void {
    const el = document.getElementById('max-time');
    if (el) {
      el.textContent = formatTime(ms);
    }
  }
}