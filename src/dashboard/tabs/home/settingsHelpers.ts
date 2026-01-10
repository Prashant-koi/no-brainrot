import { ToggleStatus } from '../../../types/types';

const BLOCKER_SETTINGS: { key: string; label: string }[] = [
  { key: 'youtube-blocker', label: 'YouTube Shorts' },
  { key: 'instagram-blocker', label: 'Instagram Reels' },
  { key: 'facebook-blocker', label: 'Facebook Reels' },
  { key: 'tiktok-blocker', label: 'TikTok' },
];

const TRACK_SETTINGS: { key: string; label: string }[] = [
  { key: 'track-youtube', label: 'YouTube' },
  { key: 'track-youtubemusic', label: 'YouTube Music' },
  { key: 'track-instagram', label: 'Instagram' },
  { key: 'track-facebook', label: 'Facebook' },
  { key: 'track-tiktok', label: 'TikTok' },
];

export async function fetchBlockerStatuses(): Promise<ToggleStatus[]> {
  const keys = BLOCKER_SETTINGS.map((s) => s.key);
  const result = await chrome.storage.local.get(keys);
  return BLOCKER_SETTINGS.map(({ key, label }) => ({
    label,
    enabled: result[key] !== false,
  }));
}

export async function fetchTrackedStatuses(): Promise<ToggleStatus[]> {
  const keys = TRACK_SETTINGS.map((s) => s.key);
  const result = await chrome.storage.local.get([...keys, 'custom-platforms']);
  const custom = Array.isArray(result['custom-platforms']) ? result['custom-platforms'] : [];

  const base = TRACK_SETTINGS.map(({ key, label }) => ({
    label,
    enabled: result[key] !== false,
  }));

  const customStatuses = custom.map((domain: string) => {
    const key = `track-custom-${domain.toLowerCase()}`;
    const enabled = result[key] !== false; // default true if absent
    return { label: domain, enabled } as ToggleStatus;
  });

  return [...base, ...customStatuses];
}
