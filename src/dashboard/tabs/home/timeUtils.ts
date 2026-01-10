import { DailyStats } from '../../../types/types';

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

export function totalMsForDay(stats: DailyStats): number {
  return Object.values(stats.totalByPlatform || {}).reduce((sum, v) => sum + v, 0);
}
