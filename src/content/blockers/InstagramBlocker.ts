import { BaseBlocker } from "./BaseBlocker";

export class InstagramBlocker extends BaseBlocker {
        getPlatformName(): string {
        return 'Instagram';
    }

    getBlockedSelectors(): string[] {
        return [
            // Reels tab in navigation
            'a[href*="/reels/"]',
            'svg[aria-label="Reels"]',

            // Reels in feed
            'article:has([href*="/reel/"])',


            //reels in Home
            'article',

            'div[class*="x11lhmoz"]', // Instagram's obfuscated class names
            // 'div[class*="x1n2onr6"]',
            
        ];
    }

    getRedirectPatterns(): RegExp[] {
        return [
            /instagram\.com\/reels?\//,
            /instagram\.com\/p?\//,
            // /instagram\.com\/stories?\//, //uncomment if wanna redirect from stories
        ];
    }

    getRedirectUrl(): string {
        return 'https://www.instagram.com';
    }

    /* while we don't need an implementation customBlockLogic for instagram, I am gonna keep it here 
    just in case things change in the future
    */
    // protected customBlockLogic(): void {

    // }
}