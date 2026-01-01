import './dashboard.css';

const app = document.getElementById("app")!;

app.innerHTML = `
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <button id="refresh" class="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700">
        Refresh
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
        <div class="text-sm text-zinc-400 mb-2">Pie chart</div>
        <div id="pie" class="h-64"></div>
      </div>

      <div class="rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
        <div class="text-sm text-zinc-400 mb-2">Bar chart</div>
        <div id="bar" class="h-64"></div>
      </div>
    </div>
  </div>
`;

document.getElementById("refresh")?.addEventListener("click", () => {
  
});
