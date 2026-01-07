import type { IBlocker } from "../../types/types";

export abstract class BaseBlocker implements IBlocker{
  protected observer: MutationObserver | null = null;
  protected blockedCount: number = 0;
  protected navInterval: number | null = null;
  private settingListenerAdded = false;
  private enabled = false;

  abstract getPlatformName(): string;
  abstract getBlockedSelectors(): string[];
  abstract getRedirectPatterns(): RegExp[];
  abstract getRedirectUrl(): string;

  initialize(): void {
    //cecking the stored toggle
    this.checkEnabledAndStart();
    this.registerSettingListener();
  }

  private async checkEnabledAndStart(): Promise<void> {
    const enabled = await this.isEnabled();
    if (!enabled) {
      console.log(`[No Brainrot] ${this.getPlatformName()} blocker is disabled`);
      return;
    }
    this.enable();
  }

  private async isEnabled(): Promise<boolean> {
    const key = this.getSettingKey();
    const data = await chrome.storage.local.get(key);
    return data[key] !== false;
  }

  private getSettingKey(): string {
    return `${this.getPlatformName().toLowerCase()}-blocker`;
  }

  private registerSettingListener(): void {
    if (this.settingListenerAdded) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const key = this.getSettingKey();
      if (key in changes) {
        const newVal = changes[key].newValue;
        const enabled = newVal !== false; 
        if (enabled) {
          this.enable();
        } else {
          this.disable();
        }
      }
    });
    this.settingListenerAdded = true;
  }

  private enable(): void {
    if (this.enabled) return;
    this.enabled = true;

    console.log(`[No Brainrot] Initializing ${this.getPlatformName()} blocker`);
    
    // check for blocked page eg shorts or reels and redirect(might change this later to not redirect as redirection can be annoying)
    this.checkAndRedirect();
    
    // this will block the elements on page
    this.blockElements();

    //custom blockign logiv
    this.customBlockLogic();
    
    // this will watch for dynamically loaded content
    this.startObserver();
    
    // Listen for navigation changes
    this.watchNavigation();
  }

  private disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    console.log(`[No Brainrot] Disabling ${this.getPlatformName()} blocker`);
    this.destroy();
    this.unblockAll();
  }

  protected checkAndRedirect(): void {
    const currentUrl: string = window.location.href;
    const patterns: RegExp[] = this.getRedirectPatterns();
    
    for (const pattern of patterns) {
      if (pattern.test(currentUrl)) {
        console.log(`[No Brainrot] Redirecting from blocked page: ${currentUrl}`);
        window.location.href = this.getRedirectUrl();
        return;
      }
    }
  }

  protected blockElements(): void {
    const selectors = this.getBlockedSelectors();
    let blocked = 0;
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (this.hideElement(element as HTMLElement)) {
            blocked++;
          }
        });
      } catch (e) {
        console.error(`[No Brainrot] Error with selector "${selector}":`, e);
      }
    });
    
    if (blocked > 0) {
      console.log(`[No Brainrot] Blocked ${blocked} elements`);
    }
  }

  protected hideElement(element: HTMLElement): boolean {
    if (!element.hasAttribute('data-brainrot-blocked')) {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.height = '0';
      element.style.overflow = 'hidden';
      element.setAttribute('data-brainrot-blocked', 'true');
      this.blockedCount++;
      return true;
    }
    return false;
  }

  // We will overide this in platform-specific blockers 
  protected customBlockLogic(): void {
    
  }

  protected startObserver(): void {
    const startObserving = () => {
      if (document.body) {
        this.observer = new MutationObserver(() => {
          this.blockElements();
          this.customBlockLogic();
        });

        this.observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        
        console.log(`[No Brainrot] Observer started for ${this.getPlatformName()}`);
      } else {
        // Body doesn't exist yet
        setTimeout(startObserving, 100);
      }
    };

    startObserving();
  }

  protected watchNavigation(): void {
    if (this.navInterval) {
      clearInterval(this.navInterval);
    }
    // For SPAs, watch for URL changes
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.checkAndRedirect();
        this.blockElements();
      }
    };

    this.navInterval = setInterval(checkUrlChange, 500) as unknown as number;
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.navInterval) {
      clearInterval(this.navInterval);
      this.navInterval = null;
    }
  }

  private unblockAll(): void {
    document.querySelectorAll('[data-brainrot-blocked]').forEach(el => {
      const elmt = el as HTMLElement;
      elmt.style.display = '';
      elmt.style.visibility = '';
      elmt.style.height = '';
      elmt.style.overflow = '';
      elmt.removeAttribute('data-brainrot-blocked');
    });
  }
}