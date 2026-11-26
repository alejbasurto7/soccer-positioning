# Find Your Spot

A free web app that teaches young soccer players (ages 5 to 13) where to stand on the field.
Pick your position, move the ball, and watch every player move to the right spot.

It is an original app. It has its own positioning engine and its own coaching tips. It is not affiliated with any other soccer positioning product.

## Features

- **Interactive field**: drag the ball anywhere (or use arrow keys). Both teams move to their spots.
- **Who has the ball**: "We have it", "They have it", "Loose ball". Each changes the team shape.
- **Situations**: open play, corners for and against (left and right), free kicks for and against (with a wall), goal kicks for and against, kickoffs for and against.
- **Team sizes**: 7v7 (2-3-1, 3-2-1, 2-1-2-1), 9v9 (3-2-3, 3-3-2, 2-4-2), 11v11 (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3).
- **Build-out lines** drawn for 7v7 and 9v9.
- **Coach tips**: for each position, three tips for each phase (we have it, they have it, loose ball) in each third of the field. Set pieces show the player's job (for example "Be in the wall", "Near post run").
- **Quiz mode**: the app hides your player. You tap where you think you should be and get scored in yards. It keeps a streak.
- **Your kit**: six kit colors and your own shirt number.
- **Team link**: coaches set size and formation, tap "Copy team link", and send it. Players open it and only pick their position.
- **Works offline** and installs to the home screen (PWA). No accounts, no tracking. Settings stay on the device.

## Run locally

No build step. Serve the folder with any static server:

```
python3 -m http.server 8000
# open http://localhost:8000
```

Engine tests: `node tests/engine.test.js`

## Publish for free on GitHub Pages

1. Merge this branch into `main` (or pick this branch in step 3).
2. On GitHub: repository **Settings → Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the app is live at `https://<your-username>.github.io/soccer-positioning/`.
5. Open the app, set your team size and formation, tap **Copy team link**, and send it to your players.

On a phone, players can use "Add to Home Screen" to install it like an app.

## Files

| File | Purpose |
|---|---|
| `engine.js` | Field sizes, formations, and the positioning rules for every situation |
| `tips.js` | Coaching tips by role, field third and phase, plus set-piece jobs |
| `app.js` | Field drawing, dragging, coach panel, quiz, setup |
| `index.html`, `styles.css` | Page and layout |
| `sw.js`, `manifest.webmanifest`, icons | Offline and install support |

## Changing things

- **Positions**: base spots for each formation are in `FORMATIONS` in `engine.js` (x: 0 left to 1 right, y: 0 our goal to 1 their goal).
- **Tips**: edit `tips.js`. Keep three short tips per entry.
- **Field sizes**: `SIZES` in `engine.js` (meters).

After changing files, bump `CACHE` in `sw.js` so installed copies update.
