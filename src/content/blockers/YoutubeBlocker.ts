import { BaseBlocker } from "./BaseBlocker";

export class YouTubeBlocker extends BaseBlocker {
    getPlatformName(): string {
        return 'Youtube';
    }

    getBlockedSelectors(): string[] {
        return [
            // Shorts shelf on the homepage
            'ytd-rich-shelf-renderer',
            'ytd-reel-shelf-renderer',
            'ytm-reel-shelf-renderer',
            
            // Shorts tab in sidebar
            'ytd-guide-entry-renderer a[title="Shorts"]',
            'ytd-mini-guide-entry-renderer a[title="Shorts"]',
            'a#endpoint[title="Shorts"]',
            
            // Shorts button
            '#shorts-button',
        ];
    }

    getRedirectPatterns(): RegExp[] {
        return [
            /youtube\.com\/shorts\//,
        ];
    }

    getRedirectUrl(): string {
        return 'https://www.youtube.com';
    }

     // shorts blocking logic like the shorts we get when we search for someting in youtube
     //though it definately makes the search results looks more ugly right now because the 
     // "shorts" text is still there but I can fix that
     //I also blocks shorts in individual channels so like if i go to youtube.com/anychannel/shorts
     //it will also block that
    protected customBlockLogic(): void {
        let blocked = 0;

        // blockign links to shorts
        const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');

        shortsLinks.forEach(link => {

            if (this.hideElement(link as HTMLElement)) {
            blocked++;
            }
            
            let parent = link.parentElement;
            let depth = 0;
            
            while (parent && depth < 15) {
            const tagName = parent.tagName.toLowerCase();
            
            //video container elements in youtube
            if (
                tagName === 'ytd-video-renderer' ||
                tagName === 'ytd-rich-item-renderer' ||
                tagName === 'ytd-grid-video-renderer' ||
                tagName === 'ytd-compact-video-renderer' ||
                tagName === 'ytm-shorts-lockup-view-model' ||
                tagName === 'ytm-video-with-context-renderer'
            ) {
                if (this.hideElement(parent as HTMLElement)) {
                blocked++;
                }
                break;
            }
            
            parent = parent.parentElement;
            depth++;
            }
        });

        // we are blocking the shorts tabs entry here
        const guideEntries = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
        guideEntries.forEach((entry: Element) => {
            const titleEl = entry.querySelector('[title="Shorts"]');
            if (titleEl) {
            if (this.hideElement(entry as HTMLElement)) {
                blocked++;
            }
            }
        });

        if (blocked > 0) {
            console.log(`[No Brainrot] Custom logic blocked ${blocked} additional elements`);
        }
    }


}