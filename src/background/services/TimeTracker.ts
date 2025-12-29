import { PlatformName, TimeEntry, DailyStats, TrackedTab } from "../../types/types"

//code citation thanks to: https://github.com/Stigmatoz/web-activity-time-tracker/blob/master/src/tracker.ts


const TRACK_INTERVAL = 1000; // Tracking every second
const SAVE_INTERVAL = 60000; // Saving every 60 seconds
const IDLE_THRESHOLD = 60; // Consider idle after 60 seconds

export class TimeTracker {
    private trackedTabs: Map<number, TrackedTab> = new Map();
    private trackInterval: number | null = null;
    private saveInterval: number | null = null;


    

    constructor() {
        this.setupListeners();
        this.startContinuousTracking();
    }




    private setupListeners(): void {
        // When URL changes
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (changeInfo.url) {
                this.checkAndUpdateTab(tabId);
            }
        });

        // When tab is closed
        chrome.tabs.onRemoved.addListener((tabId) => {
            this.endTabSession(tabId);
        });
    }





    private startContinuousTracking(): void {
        if (this.trackInterval) {
            clearInterval(this.trackInterval);
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }

        // every second
        this.trackInterval = setInterval(() => {
            this.trackCurrentState();
        }, TRACK_INTERVAL) as unknown as number;

        // every 60 seconds
        this.saveInterval = setInterval(() => {
            this.saveAllCurrentSessions();
        }, SAVE_INTERVAL) as unknown as number;

        console.log('[TimeTracker] Continuous tracking started');
    }




    private async trackCurrentState(): Promise<void> {
        try 
        {
            const window = await chrome.windows.getLastFocused({ populate: true });
            
            if (!window.focused) {
                this.pauseAllSessions();
                return;
            }

            const activeTab = window.tabs?.find(t => t.active);
            if (!activeTab?.url) {
                this.pauseAllSessions();
                return;
            }

            const idleState = await chrome.idle.queryState(IDLE_THRESHOLD);
            
            const tabsToTrack = new Set<number>();

            const activePlatform = this.getPlatformFromUrl(activeTab.url);
            const isActiveTracked = activePlatform !== 'Other';
            
            if (isActiveTracked && idleState === 'active') {
                tabsToTrack.add(activeTab.id!);
                
                const existing = this.trackedTabs.get(activeTab.id!);
                if (!existing || existing.platform !== activePlatform) {
                    if (existing) {
                        this.endTabSession(activeTab.id!);
                    }
                    this.trackedTabs.set(activeTab.id!, {
                        tabId: activeTab.id!,
                        platform: activePlatform,
                        startTime: Date.now(),
                    });
                    console.log(`Started tracking ${activePlatform} (tab ${activeTab.id})`);
                }
            }

            // tabs playing audio
            if (window.tabs) {
                for (const tab of window.tabs) {
                    
                    if (tab.id === activeTab.id) continue;
                    
                    if (tab.audible && tab.url && tab.id) {
                        const platform = this.getPlatformFromUrl(tab.url);
                        if (platform !== 'Other') {
                            tabsToTrack.add(tab.id);
                            
                            const existing = this.trackedTabs.get(tab.id);
                            if (!existing || existing.platform !== platform) {
                                if (existing) {
                                    this.endTabSession(tab.id);
                            }
                            this.trackedTabs.set(tab.id, {
                                tabId: tab.id,
                                platform: platform,
                                startTime: Date.now(),
                            });
                            console.log(`Started tracking ${platform} (tab ${tab.id}) - playing audio`);
                            }
                        }
                    }
                }

            
                for (const [tabId] of this.trackedTabs.entries()) {
                    if (!tabsToTrack.has(tabId)) {
                        this.endTabSession(tabId);
                    }
                }

            }
        } catch (error) {
            console.error('[TimeTracker] Error in trackCurrentState:', error);
        }
    }




    private pauseAllSessions(): void {
        const tabIds = Array.from(this.trackedTabs.keys());
        tabIds.forEach(tabId => this.endTabSession(tabId));
    }




    private async checkAndUpdateTab(tabId: number): Promise<void> {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (!tab.url) return;

            const platform = this.getPlatformFromUrl(tab.url);
            const existing = this.trackedTabs.get(tabId);

            if (existing && existing.platform !== platform) {
                this.endTabSession(tabId);
            }
        } catch (error) {
            // Tab might be closed
            this.endTabSession(tabId);
        }
    }




    private saveAllCurrentSessions(): void {
        const now = Date.now();

        for (const [tabId, tracked] of this.trackedTabs.entries()) {
            const duration = now - tracked.startTime;

            if (duration < 1000) continue; 

            const entry: TimeEntry = {
                platform: tracked.platform,
                startTime: tracked.startTime,
                endTime: now,
                duration: duration,
            };

            console.log(`Saving session: ${entry.platform} (tab ${tabId}), Duration: ${Math.round(duration / 1000)}s`);

            this.saveEntry(entry);

            
            tracked.startTime = now;
        }
    }


    

    private endTabSession(tabId: number): void {
        const tracked = this.trackedTabs.get(tabId);
        if (!tracked) return;

        const endTime = Date.now();
        const duration = endTime - tracked.startTime;

        if (duration >= 1000) { 
            const entry: TimeEntry = {
                platform: tracked.platform,
                startTime: tracked.startTime,
                endTime: endTime,
                duration: duration,
            };

            console.log(`Ended session: ${entry.platform} (tab ${tabId}), Duration: ${Math.round(duration / 1000)}s`);
            this.saveEntry(entry);
        }

        this.trackedTabs.delete(tabId);
    }




    private getPlatformFromUrl (url: string): PlatformName | 'Other' {
        try {
            const hostname = new URL(url).hostname;

            if (hostname.includes('music.youtube.com')) return 'YoutubeMusic';
            if (hostname.includes('youtube.com')) return 'YouTube';
            if (hostname.includes('instagram.com')) return 'Instagram';
            if (hostname.includes('facebook.com')) return 'Facebook';
            if (hostname.includes('tiktok.com')) return 'TikTok';

            return 'Other';
        } catch {
            return 'Other';
        }
    }





    /* 
    I will be saving in local storage for now just to get this tracking system done
    but I plan to make it into SQLite 
    */

    private async saveEntry (entry: TimeEntry): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `stats:${today}`;

        //get existing stuff for today
        const result= await chrome.storage.local.get(storageKey) as Record<string, DailyStats>;
        const dailyStats: DailyStats = result[storageKey] || {
            date : today,
            entries: [],
            totalByPlatform: {} ,
        }

        dailyStats.entries.push(entry);

        //update total
        const platform = entry.platform;
        dailyStats.totalByPlatform[platform] = (dailyStats.totalByPlatform[platform] || 0) + (entry.duration || 0);

        await chrome.storage.local.set({ [storageKey]: dailyStats});

        // console.log(`Saved entry for ${platform}: ${Math.round(entry.duration || 0) / 1000}s`);
        console.log(`✅ SAVED to DB: ${platform} +${Math.round(entry.duration || 0) / 1000}s (Total: ${Math.round(dailyStats.totalByPlatform[platform] / 1000)}s)`);

    }




    public async getTodayStats(): Promise<DailyStats | null> {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `stats:${today}`;
        const result = await chrome.storage.local.get(storageKey) as Record<string, DailyStats>;
        const savedStats: DailyStats = result[storageKey] || {
            date: today,
            entries: [],
            totalByPlatform: {},
        };

        const liveStats: DailyStats = {
            date: savedStats.date,
            entries: [...savedStats.entries],
            totalByPlatform: { ...savedStats.totalByPlatform },
        };

        // Adding currently active sessions 
        const now = Date.now();
        for (const [tabId, tracked] of this.trackedTabs.entries()) {
            const currentDuration = now - tracked.startTime;
            
            const platform = tracked.platform;
            liveStats.totalByPlatform[platform] = 
                (liveStats.totalByPlatform[platform] || 0) + currentDuration;
            
            console.log(`[getTodayStats] Adding live session: ${platform} (tab ${tabId}), +${Math.round(currentDuration / 1000)}s`);
        }

        return liveStats;
    }




    public async getStatsForDate(date: string): Promise<DailyStats | null> {
        const storageKey = `stats:${date}`;
        const result = await chrome.storage.local.get(storageKey) as Record<string, DailyStats>;
        return result[storageKey] || null;
    }




    public async getAllStats(): Promise<DailyStats[]> {
        const allData = await chrome.storage.local.get(null) as Record<string, DailyStats>;
        const stats: DailyStats[] = [];

        for (const key in allData) {
            if(key.startsWith('stats:')) {
                stats.push(allData[key]);
            }
        }

        //newest date first
        return stats.sort((a,b) => b.date.localeCompare(a.date));
    }





}