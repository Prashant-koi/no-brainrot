import { YouTubeBlocker } from './blockers/YoutubeBlocker';
import { InstagramBlocker } from './blockers/InstagramBlocker';
import { FacebookBlocker } from './blockers/FacebookBlocker';
import { TiktokBlocker } from './blockers/TiktokBlocker';
import { BaseBlocker } from './blockers/BaseBlocker';


console.log('[No Brainrot] Content script loaded on:', window.location.href);

function initializeBlocker(): void {
  const hostname = window.location.hostname;
  let blocker: BaseBlocker | null = null;

  console.log('[No Brainrot] Hostname detected:', hostname);

  if (hostname.includes('youtube.com')) {
    console.log('[No Brainrot] Creating YouTube blocker');
    blocker = new YouTubeBlocker();
  } else if (hostname.includes('instagram.com')) {
    console.log('[No Brainrot] Creating Instagram blocker');
    blocker = new InstagramBlocker();
  } else if (hostname.includes('facebook.com')) {
    console.log('[No Brainrot] Creating Facebook blocker');
    blocker = new FacebookBlocker();
  } else if (hostname.includes('tiktok.com')) {
    console.log('[No Brainrot] Creating TikTok blocker');
    blocker = new TiktokBlocker();
  }

  if (blocker) {
    blocker.initialize();
  } else {
    console.log('[No Brainrot] No blocker for this site');
  }
}

// Initialize immediately
initializeBlocker();

// Also initialize when DOM is ready (backup)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[No Brainrot] DOM ready, re-initializing');
    initializeBlocker();
  });
}