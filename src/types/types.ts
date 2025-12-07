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
export type PlatformName = 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok';

export interface TimeEntry {
    platform: PlatformName | 'Other';
    startTime: number;
    endTime?: number;
    duration?: number;
}

export interface DailyStats {
    date: string;
    entries: TimeEntry[];
    totalByPlatform: Record<string, number>;
}

//time tracker end