import { Tab } from '../index';

export class BlockerSettingsTab implements Tab {
  render(): string {
    return `
      <div class="tab-content">
        <h1 class="text-3xl font-bold mb-8">Blocker Settings</h1>
        
        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Platform Blockers</h2>
          <p class="text-zinc-400 mb-6">Enable or disable content blocking for each platform</p>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">YouTube Shorts</div>
                <div class="setting-desc">Block YouTube Shorts feed and redirects</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="youtube-blocker" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">Instagram Reels</div>
                <div class="setting-desc">Block Instagram Reels feed and redirects</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="instagram-blocker" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">Facebook Reels</div>
                <div class="setting-desc">Block Facebook Reels feed and redirects</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="facebook-blocker" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">TikTok</div>
                <div class="setting-desc">Block entire TikTok website</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="tiktok-blocker" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <button id="save-blocker-settings" class="refresh-btn">
          Save Settings
        </button>
      </div>
    `;
  }

  async mount(): Promise<void> {
    await this.loadSettings();

    document.getElementById('save-blocker-settings')?.addEventListener('click', () => {
      this.saveSettings();
    });
  }

  unmount(): void {
    // Cleanup 
  }

  private async loadSettings(): Promise<void> {
    const settings = await chrome.storage.local.get([
      'youtube-blocker',
      'instagram-blocker',
      'facebook-blocker',
      'tiktok-blocker',
    ]);

    // defult true
    (document.getElementById('youtube-blocker') as HTMLInputElement).checked = 
      settings['youtube-blocker'] !== false;
    (document.getElementById('instagram-blocker') as HTMLInputElement).checked = 
      settings['instagram-blocker'] !== false;
    (document.getElementById('facebook-blocker') as HTMLInputElement).checked = 
      settings['facebook-blocker'] !== false;
    (document.getElementById('tiktok-blocker') as HTMLInputElement).checked = 
      settings['tiktok-blocker'] !== false;
  }

  private async saveSettings(): Promise<void> {
    const settings = {
      'youtube-blocker': (document.getElementById('youtube-blocker') as HTMLInputElement).checked,
      'instagram-blocker': (document.getElementById('instagram-blocker') as HTMLInputElement).checked,
      'facebook-blocker': (document.getElementById('facebook-blocker') as HTMLInputElement).checked,
      'tiktok-blocker': (document.getElementById('tiktok-blocker') as HTMLInputElement).checked,
    };

    await chrome.storage.local.set(settings);
    
  
    const btn = document.getElementById('save-blocker-settings');
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
}