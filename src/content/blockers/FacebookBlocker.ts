import { BaseBlocker } from "./BaseBlocker";

export class FacebookBlocker extends BaseBlocker {
        getPlatformName(): string {
        return 'Facebook';
    }

    getBlockedSelectors(): string[] {
        return [
            // Reels in feed
            'div[data-pagelet*="Reels" i]',
            'div[aria-label*="Reels" i]',
            'a[href*="/reel/"]',
            
        ];
    }

    getRedirectPatterns(): RegExp[] {
        return [
            /facebook\.com\/reels?\//,
            // /facebook\.com\/stories?\//,    //uncomment if wanna redirect from stories
        ];
    }

    getRedirectUrl(): string {
        return 'https://www.facebook.com';
    }

    /* while we don't need an implementation customBlockLogic for instagram, I am gonna keep it here 
    just in case things change in the future
    */
    // protected customBlockLogic(): void {

    // }
}