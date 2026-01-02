import { Tab } from '../index';

export class TrackerSettingsTab implements Tab {
  render(): string {
    return `
      <div class="tab-content">
        <h1 class="text-3xl font-bold mb-8">Tracker Settings</h1>
        
        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Time Tracking</h2>
          <p class="text-zinc-400 mb-6">Configure which platforms to track time for</p>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">YouTube</div>
                <div class="setting-desc">Track time spent on YouTube</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="track-youtube" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">YouTube Music</div>
                <div class="setting-desc">Track time spent on YouTube Music</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="track-youtubemusic" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">Instagram</div>
                <div class="setting-desc">Track time spent on Instagram</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="track-instagram" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">Facebook</div>
                <div class="setting-desc">Track time spent on Facebook</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="track-facebook" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">TikTok</div>
                <div class="setting-desc">Track time spent on TikTok</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="track-tiktok" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Data Management</h2>
          <button id="clear-all-data" class="danger-btn">
            Clear All Tracking Data
          </button>
        </div>

        <button id="save-tracker-settings" class="refresh-btn">
          Save Settings
        </button>
      </div>
    `;
  }

  async mount(): Promise<void> {
    await this.loadSettings();

    document.getElementById('save-tracker-settings')?.addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('clear-all-data')?.addEventListener('click', () => {
      this.clearAllData();
    });
  }

  unmount(): void {
    // cleup
  }

  private async loadSettings(): Promise<void> {
    const settings = await chrome.storage.local.get([
      'track-youtube',
      'track-youtubemusic',
      'track-instagram',
      'track-facebook',
      'track-tiktok',
    ]);

    (document.getElementById('track-youtube') as HTMLInputElement).checked = 
      settings['track-youtube'] !== false;
    (document.getElementById('track-youtubemusic') as HTMLInputElement).checked = 
      settings['track-youtubemusic'] !== false;
    (document.getElementById('track-instagram') as HTMLInputElement).checked = 
      settings['track-instagram'] !== false;
    (document.getElementById('track-facebook') as HTMLInputElement).checked = 
      settings['track-facebook'] !== false;
    (document.getElementById('track-tiktok') as HTMLInputElement).checked = 
      settings['track-tiktok'] !== false;
  }

  private async saveSettings(): Promise<void> {
    const settings = {
      'track-youtube': (document.getElementById('track-youtube') as HTMLInputElement).checked,
      'track-youtubemusic': (document.getElementById('track-youtubemusic') as HTMLInputElement).checked,
      'track-instagram': (document.getElementById('track-instagram') as HTMLInputElement).checked,
      'track-facebook': (document.getElementById('track-facebook') as HTMLInputElement).checked,
      'track-tiktok': (document.getElementById('track-tiktok') as HTMLInputElement).checked,
    };

    await chrome.storage.local.set(settings);
    
    const btn = document.getElementById('save-tracker-settings');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Saved!';
      btn.style.background = '#22c55e';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#4ade80';
      }, 2000);
    }
  }

  private async clearAllData(): Promise<void> {
    if (!confirm('Are you sure you want to clear all tracking data? This cannot be undone.')) {
      return;
    }

    const allData = await chrome.storage.local.get(null);
    const keysToRemove: string[] = [];

    for (const key in allData) {
      if (key.startsWith('stats:')) {
        keysToRemove.push(key);
      }
    }

    await chrome.storage.local.remove(keysToRemove);
    
    alert('All tracking data has been cleared!');
  }
}