import { Tab } from '../../types/types';

export class TrackerSettingsTab implements Tab {
  render(): string {
    return `
      <div class="tab-content">
        <h1 class="text-3xl font-bold mb-8">Tracker Settings</h1>
        
        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Time Tracking</h2>
          <p class="text-zinc-400 mb-6">Configure which platforms to track time for</p>
          
          <div class="settings-list" id="platforms-list">
            <!-- Default platforms will be inserted here -->
          </div>
        </div>

        <div class="stats-card mb-6">
          <h2 class="text-xl font-semibold mb-4">Add Custom Website</h2>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input 
              type="text" 
              id="custom-domain" 
              placeholder="example.com"
              style="flex: 1; padding: 12px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; color: #fff; font-size: 14px;"
            />
            <button id="add-custom-site" class="refresh-btn" style="width: auto; padding: 12px 24px;">
              Add
            </button>
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

    document.getElementById('add-custom-site')?.addEventListener('click', () => {
      this.addCustomSite();
    });

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
    const allSettings = await chrome.storage.local.get(null);
    const platformsList = document.getElementById('platforms-list')!;
    platformsList.innerHTML = '';

    //Below are Default platforms
    const defaultPlatforms = [
      { id: 'youtube', name: 'YouTube' },
      { id: 'youtubemusic', name: 'YouTube Music' },
      { id: 'instagram', name: 'Instagram' },
      { id: 'facebook', name: 'Facebook' },
      { id: 'tiktok', name: 'TikTok' },
    ];

    defaultPlatforms.forEach(platform => {
      const isEnabled = allSettings[`track-${platform.id}`] !== false;
      platformsList.innerHTML += this.createPlatformItem(platform.id, platform.name, isEnabled, false);
    });

    //these are for custom platforms
    const rawCustom = allSettings['custom-platforms'];
    const customPlatforms: string[] = Array.isArray(rawCustom) ? rawCustom : [];
    customPlatforms.forEach((domain: string) => {
      const isEnabled = allSettings[`track-custom-${domain}`] !== false;
      platformsList.innerHTML += this.createPlatformItem(`custom-${domain}`, domain, isEnabled, true);
    });

    this.attachRemoveListeners();
  }





  private createPlatformItem(id: string, name: string, checked: boolean, isCustom: boolean): string {
    return `
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-name">${name}</div>
          <div class="setting-desc">Track time spent on ${name}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          ${isCustom ? `
            <button class="remove-platform" data-platform="${id}" style="background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
              ✕ Remove
            </button>
          ` : ''}
          <label class="toggle-switch">
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
  }





  private async addCustomSite(): Promise<void> {
    const input = document.getElementById('custom-domain') as HTMLInputElement;
    let domain = input.value.trim().toLowerCase();

    if (!domain) {
      alert('Please enter a domain name');
      return;
    }

    // domain cleanup
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    if (!domain.includes('.') || domain.length < 3) {
      alert('Please enter a valid domain (e.g., example.com)');
      return;
    }

    const allSettings = await chrome.storage.local.get(null);
    const customPlatforms: string[] = Array.isArray(allSettings['custom-platforms'])
      ? allSettings['custom-platforms']
      : [];

    if (customPlatforms.includes(domain)) {
      alert('This website is already being tracked');
      return;
    }

    customPlatforms.push(domain);
    await chrome.storage.local.set({ 
      'custom-platforms': customPlatforms,
      [`track-custom-${domain}`]: true 
    });

    input.value = '';
    await this.loadSettings();
    this.attachRemoveListeners();
  }





  private attachRemoveListeners(): void {
    document.querySelectorAll('.remove-platform').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const platformId = (e.target as HTMLElement).dataset.platform!;
        const domain = platformId.replace('custom-', '');
        
        if (!confirm(`Remove ${domain} from tracking?`)) return;

        const allSettings = await chrome.storage.local.get(null);
        const rawCustom = allSettings['custom-platforms'];
        const customPlatforms: string[] = Array.isArray(rawCustom) ? rawCustom : [];
        const updated = customPlatforms.filter(d => d !== domain);

        await chrome.storage.local.set({ 'custom-platforms': updated });
        await chrome.storage.local.remove(`track-custom-${domain}`);

        await this.loadSettings();
        this.attachRemoveListeners();
      });
    });
  }





  private async saveSettings(): Promise<void> {
      const allInputs = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
      const settings: Record<string, boolean> = {};

      allInputs.forEach(input => {
        const key = `track-${input.id}`; 
        settings[key] = input.checked;
      });

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