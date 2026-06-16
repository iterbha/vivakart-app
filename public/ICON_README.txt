APP ICONS FOR VIVAKART
======================

You need these icon files in the /public folder:
- icon-192.png  (192x192 pixels)
- icon-512.png  (512x512 pixels)
- favicon.ico   (32x32 pixels)

How to generate them:
1. Open icon.svg in any browser
2. Take a screenshot or use an online tool like https://realfavicongenerator.net
3. Or use: npx pwa-asset-generator icon.svg ./public --padding "15%"

For Play Store you also need:
- App icon: 512x512 PNG (no transparency, no rounded corners — Play Store adds them)
- Feature graphic: 1024x500 PNG (banner shown on listing page)
