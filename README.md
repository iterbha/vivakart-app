# VIVAKART (विवाकार्ट)

Village grocery & function-supplies delivery app for **Kundri-Sankuraha Panchayat, Jamui District, Bihar**.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:5173 in browser
```

## Build for Production

```bash
npm run build
# Output goes to /dist folder
```

## Deploy to Firebase (Free)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # Select 'dist' as public dir, configure as SPA
firebase deploy
```

## Publish to Google Play Store

1. Deploy to Firebase (above)
2. Go to https://www.pwabuilder.com → enter your Firebase URL
3. Click "Package for stores" → "Android" → download AAB
4. Upload AAB to Google Play Console ($25 one-time fee)

See `VIVAKART_PlayStore_Guide.md` for detailed steps.

## Project Structure

```
vivakart-app/
├── public/
│   ├── icon.svg              # Logo source (generate PNGs from this)
│   └── ICON_README.txt       # Icon generation instructions
├── src/
│   ├── App.jsx               # Main VIVAKART app (all screens)
│   ├── App.css               # Tailwind CSS + mobile tweaks
│   └── main.jsx              # React entry point
├── index.html                # HTML entry with PWA meta tags
├── vite.config.js            # Vite + React + Tailwind + PWA config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Service Area

**Villages (PIN 811313):**
Kundri, Sankuraha, Kharsari Nichli Tola, Kharsari Upraili Tola, Harla, Mahugain, Pyarepur, Chandwara

**Shops:** Wholesale shops in Jamui town (PIN 811307)

**Delivery ETA:** 3 hours max, FREE delivery

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Lucide React icons
- PWA with Workbox (offline support)
- TWA wrapper for Google Play Store (via PWABuilder)

## License

Private — VIVAKART, Kundri-Sankuraha Panchayat
