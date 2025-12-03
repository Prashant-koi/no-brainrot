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