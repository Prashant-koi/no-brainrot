import './dashboard.css';
import { HomeTab } from './tabs/HomeTab';
import { BlockerSettingsTab } from './tabs/BlockerSettingTab';
import { TrackerSettingsTab } from './tabs/TrackerSettingTab';
import { Tab } from '../types/types';

type TabName = 'home' | 'blocker' | 'tracker';


class Dashboard {
  private currentTab: TabName = 'home';
  private tabs: Map<TabName, Tab>;

 constructor() {
    this.tabs = new Map<TabName, Tab>([
      ['home', new HomeTab()],
      ['blocker', new BlockerSettingsTab()],
      ['tracker', new TrackerSettingsTab()],
    ]);


    this.renderLayout();
    this.switchTab('home');
    this.setupNavigation();
  }

  private renderLayout(): void {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="dashboard-container">
        <nav class="sidebar">
          <div class="sidebar-header">
            <h2 class="text-2xl font-bold">No Brainrot</h2>
          </div>
          <ul class="nav-menu">
            <li>
              <button class="nav-item active" data-tab="home">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Home
              </button>
            </li>
            <li>
              <button class="nav-item" data-tab="blocker">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
                Blocker Settings
              </button>
            </li>
            <li>
              <button class="nav-item" data-tab="tracker">
                <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tracker Settings
              </button>
            </li>
          </ul>
        </nav>
        <main class="main-content" id="main-content">
          <!-- Tab content will be inserted here -->
        </main>
      </div>
    `;
  }

  private setupNavigation(): void {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab as TabName;
        this.switchTab(tab);
      });
    });
  }

  private switchTab(tabName: TabName): void {
    const currentTabInstance = this.tabs.get(this.currentTab);
    if (currentTabInstance) {
      currentTabInstance.unmount();
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if ((item as HTMLElement).dataset.tab === tabName) {
        item.classList.add('active');
      }
    });

    // this will render new tab
    const mainContent = document.getElementById('main-content')!;
    const newTab = this.tabs.get(tabName)!;
    mainContent.innerHTML = newTab.render();
    newTab.mount();

    this.currentTab = tabName;
  }
}

new Dashboard();
