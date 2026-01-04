# No Brainrot
No Brainrot is a browser extension that will block all shortform content from youtube, instagram, tiktok and shorts while making sure that other features like messaging, long form video and posting remains!

## Currently Blocked Websites
- Youtube shorts (check ./src/blockers/YoutubeBlocker.ts to see)
- Instagram Reels (check ./src/blockers/InstagramBlocker.ts to see)
- Facebook Reels (check ./src/blockers/FacebookBlocker.ts to see)
- Tiktok (check ./src/blockers/TiktokBlocker.ts to see)

## Social Media Time tracking
The browser extension will log the time you spend on certain social media webistes(YT, IG, LinkedIn stuff), It will not track what you are doing just that you are using them!

## Run and Build
```
#watch the errors with terminal
npm run watch

#Just build the dist
npm run build
```

## Current Features
- Short Form Content Blocker (I will probably make a disable/enable button for websites in the dashbpoard)
- Time Tracking for Social Media/Listed Websites (I will make it so that you can add the websites to the Tracking list in the dashboard)
- Dashboard which basically displays the overall analystics of your tracked time and history(dashboard will also contain settings soon)

## Dashboard
- Need to Implement the blocker settings (only the clear all data works and disable/enable tracking works right now)
