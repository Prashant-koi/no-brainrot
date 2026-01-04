export interface IBlocker {
    initialize(): void;
    destroy(): void;
    getPlatformName(): string;
    getBlockedSelectors(): string[];
    getRedirectPatterns(): RegExp[];
    getRedirectUrl(): string;
}

export type BlockerConfig = {
    platformName: string;
    blockedSelectors: string[];
    redirectPatterns: RegExp[];
    redirectUrl: string;
}

//for Time tracker
export type PlatformName = 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok' | 'YoutubeMusic';
export type CustomPlatform = `custom-${string}`;
export type TrackedPlatform = PlatformName | CustomPlatform;

export interface TimeEntry {
    platform: TrackedPlatform | 'Other';
    startTime: number;
    endTime?: number;
    duration?: number;
}

export interface DailyStats {
    date: string;
    entries: TimeEntry[];
    totalByPlatform: Record<string, number>;
}

// interface to track multiple tabs at once, but only if they're playing audio
export interface TrackedTab {
    tabId: number;
    platform: TrackedPlatform;
    startTime: number;
}

//time tracker end


//dashboard
export interface Tab {
  render(): string;
  mount(): Promise<void>;
  unmount(): void;
}
//dashbaord end