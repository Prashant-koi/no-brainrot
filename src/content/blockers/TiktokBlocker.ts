import { BaseBlocker } from "./BaseBlocker";

export class TiktokBlocker extends BaseBlocker {
  getPlatformName(): string {
    return "Tiktok";
  }

  getBlockedSelectors(): string[] {
    return [
      //I am going to block the entire feed of tiktok since all of it is shortform
      "#app",
      "body",
    ];
  }

  getRedirectPatterns(): RegExp[] {
    return [/tiktok\.com\/.*/];
  }

  getRedirectUrl(): string {
    return "about:blank";
  }

  // Override to prevent BaseBlocker from hiding <body> — we manage the entire page
  protected blockElements(): void {}

  //I will override the Redirect function because the whole tiktok website is blocked
  protected checkAndRedirect(): void {
    if (!document.body) {
      setTimeout(() => this.checkAndRedirect(), 10);
      return;
    }

    // ask background worker if this tab was opened from a chat
    chrome.runtime.sendMessage({ type: "IS_FROM_CHAT" }, (response) => {
      if (response?.isFromChat) {
        chrome.storage.local.get("allow-redirect-links", (data) => {
          if (data["allow-redirect-links"] === true) {
            return; // toggle is on, let them through
          }
          this.showBlockScreen();
        });
        return;
      }
      this.showBlockScreen();
    });
  }

  private showBlockScreen(): void {
    // we need to stop all audio or video playback before blocking the page, discovered this issue while testing the 
    // tiktok redirect PR
    document.querySelectorAll("video, audio").forEach((el) => {
      const media = el as HTMLMediaElement;
      media.pause();
      media.src = "";
      media.load();
    });

    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #000; color: #fff; text-align: center; padding: 20px;">
        <div>
            <h1 style="font-size: 48px; margin-bottom: 20px;">No Brainrot</h1>
            <p style="font-size: 24px; color: #888;">TikTok is blocked. All content here is short-form.</p>
            <p style="margin-top: 20px;">Go do something productive : )</p>
        </div>
        </div>
        `;

    // body visible
    document.body.style.cssText = "display: block !important; visibility: visible !important; overflow: hidden;";
    document.body.removeAttribute("data-brainrot-blocked");

    setTimeout(() => this.checkAndRedirect(), 1000);
  }

  /* while we don't need an implementation customBlockLogic for tiktok, I am gonna keep it here 
    just in case things change in the future
    */
  // protected customBlockLogic(): void {

  // }
}
