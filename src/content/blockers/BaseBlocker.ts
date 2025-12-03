export abstract class BaseBlocker {
  protected observer: MutationObserver | null = null;
  protected blockedCount = 0;

  abstract getPlatformName(): string;
  abstract getBlockedSelectors(): string[];
  abstract getRedirectPatterns(): RegExp[];
  abstract getRedirectUrl(): string;

  initialize(): void {
    console.log(`[No Brainrot] Initializing ${this.getPlatformName()} blocker`);
    
    // check for blocked page eg shorts or reels and redirect(might change this later to not redirect as redirection can be annoying)
    this.checkAndRedirect();
    
    // this will block the elements on page
    this.blockElements();
    
    // this will watch for dynamically loaded content
    this.startObserver();
    
    // Listen for navigation changes
    this.watchNavigation();
  }

  protected checkAndRedirect(): void {
    const currentUrl = window.location.href;
    const patterns = this.getRedirectPatterns();
    
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
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.hideElement(element as HTMLElement);
      });
    });
  }

  protected hideElement(element: HTMLElement): void {
    if (!element.hasAttribute('data-brainrot-blocked')) {
      element.style.display = 'none';
      element.setAttribute('data-brainrot-blocked', 'true');
      this.blockedCount++;
    }
  }

  protected startObserver(): void {
    this.observer = new MutationObserver(() => {
      this.blockElements();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  protected watchNavigation(): void {
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

    setInterval(checkUrlChange, 500);
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}