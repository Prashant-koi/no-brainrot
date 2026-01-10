import { DailyStats } from '../../../types/types';
import { totalMsForDay } from './timeUtils';

export function getTotalPages(historyStats: DailyStats[], pageSize: number): number {
  return Math.max(1, Math.ceil(historyStats.length / pageSize));
}

export function getHistorySlice(
  historyStats: DailyStats[],
  pageSize: number,
  currentHistoryPage: number,
): { labels: string[]; data: number[] } {
  const totalPages = getTotalPages(historyStats, pageSize);
  const pageFromEnd = totalPages - 1 - currentHistoryPage;
  const end = historyStats.length - pageFromEnd * pageSize;
  const start = Math.max(0, end - pageSize);
  const slice = historyStats.slice(start, end);

  const labels: string[] = [];
  const data: number[] = [];

  slice.forEach((s) => {
    labels.push(s.date.slice(5));
    const totalMs = totalMsForDay(s);
    data.push(Math.round(totalMs / 1000 / 60));
  });

  return { labels, data };
}

export function updatePaginationButtons(currentHistoryPage: number, totalPages: number): void {
  document.querySelectorAll<HTMLButtonElement>('.page-btn').forEach((btn) => {
    const btnPage = Number(btn.dataset.page);
    const enabled = btnPage < totalPages;
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.35';
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    if (btnPage === currentHistoryPage) {
      btn.style.borderColor = '#4ade80';
      btn.style.color = '#4ade80';
    } else {
      btn.style.borderColor = '#52525b';
      btn.style.color = '#e4e4e7';
    }
  });
}

export function getMaxTotalMs(historyStats: DailyStats[]): number {
  return historyStats.reduce((max, s) => {
    const totalMs = totalMsForDay(s);
    return Math.max(max, totalMs);
  }, 0);
}
