import { PlatformName, TimeEntry, DailyStats } from "../../types/types"


export class TimeTracker {
    private currentEntry: TimeEntry | null = null;
    private activeTabId: number | null = null;

    constructor() {
        this.setupListeners();
    }

    private setupListeners(): void {
        //when tab becomes active
        chrome.tabs.onActivated.addListener((activeInfo) =>{
            this.handleTabChange(activeInfo.tabId);
        });

        // when URL changes
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url && tab.active) {
            this.handleTabChange(tabId);
        }
        });

        //when window focus changes
        chrome.windows.onFocusChanged.addListener((windowId) => {
            if (windowId == chrome.windows.WINDOW_ID_NONE) {
                this.endCurrentSession();
            } else {
                chrome.tabs.query({active: true, windowId}, (tabs) => {
                    if (tabs[0]) {
                        this.handleTabChange(tabs[0].id!);
                    }
                })
            }
        })
    }

    private async handleTabChange(tabId: number): Promise<void> {
        this.endCurrentSession(); //end the prev session

        const tab = await chrome.tabs.get(tabId);
        if (!tab.url) return;

        const platform = this.getPlatformFromUrl(tab.url);

        if (platform == 'Other') {
            console.log('[No Brainrot][Time Tracker]Skipping non-listed site')
            return;
        }

        //new session of counting
        this.currentEntry = {
            platform,
            startTime: Date.now(),
        }
        this.activeTabId =tabId;

        console.log(`Started tracking time of ${platform}`);
    }

    private endCurrentSession(): void {
        if (!this.currentEntry) return;

        const endTime = Date.now();
        const duration = endTime - this.currentEntry.startTime;

        this.currentEntry.endTime = endTime;
        this.currentEntry.duration = duration;

        console.log(`Ended session: ${this.currentEntry.platform},  Duration: ${this.currentEntry.duration}`);

        //saving the data
        this.saveEntry(this.currentEntry);
        
        this.currentEntry = null;
        this.activeTabId = null;
    }

    private getPlatformFromUrl (url: string): PlatformName | 'Other' {
        try {
            const hostname = new URL(url).hostname;

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

        console.log(`Saved entry for ${platform}: ${Math.round(entry.duration || 0) / 1000}s`);
    }

    public async getTodayStats(): Promise<DailyStats | null> {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `stats:${today}`;
        const result =  await chrome.storage.local.get(storageKey) as Record<string, DailyStats>; //reminder to change this after SQLite
        return result[storageKey] || null;
    }

    public async getStatsForDate(date: string): Promise<DailyStats | null> {
        const storageKey = `stats${date}`;
        const result = await chrome.storage.local.get(storageKey) as Record<string, DailyStats>;
        return result[storageKey] || null;
    }

    public async getAllStats(): Promise<DailyStats[] | null> {
        const allData = await chrome.storage.local.get(null) as Record<string, DailyStats>;
        const stats: DailyStats[] = [];

        for (const key in allData) {
            if(key.startsWith('stats: ')) {
                stats.push(allData[key]);
            }
        }

        //newest date first
        return stats.sort((a,b) => b.date.localeCompare(a.date));
    }


}