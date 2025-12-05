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

            'div[class*="x11lhmoz"]',           // Instagram's obfuscated class names
            // 'div[class*="x1n2onr6"]',
            
        ];
    }

    getRedirectPatterns(): RegExp[] {
        return [
            /instagram\.com\/reels?\//,
            // /instagram\.com\/p?\//,          //will redirect you from reels sent by your friends personally I will comment this out but you can uncomment it if you want to
            // /instagram\.com\/stories?\//,    //uncomment if wanna redirect from stories
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