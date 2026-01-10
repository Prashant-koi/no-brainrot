import { Chart, ArcElement, Tooltip, Legend, PieController, BarController, CategoryScale, LinearScale, BarElement } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, PieController, BarController, CategoryScale, LinearScale, BarElement);

export type PieChartInput = {
  labels: string[];
  data: number[];
  colors: string[];
};

export function renderPieChart(
  ctx: HTMLCanvasElement,
  existing: Chart | null,
  input: PieChartInput,
): Chart {
  if (existing) {
    existing.destroy();
  }

  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: input.labels,
      datasets: [{
        data: input.data,
        backgroundColor: input.colors,
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
            font: { size: 14, family: 'system-ui, -apple-system, sans-serif' },
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
            label: (context) => {
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

export function renderBarChart(
  ctx: HTMLCanvasElement,
  existing: Chart | null,
  labels: string[],
  data: number[],
): Chart {
  if (existing) {
    existing.destroy();
  }

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Minutes per day',
        data,
        backgroundColor: '#4ade80',
        borderColor: '#16a34a',
        borderWidth: 1,
      }],
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
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#e4e4e7' }, grid: { color: '#27272a' } },
        y: { ticks: { color: '#e4e4e7' }, grid: { color: '#27272a' }, beginAtZero: true },
      },
    },
  });
}
