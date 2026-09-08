# ARC Robotics slides

UTRA presentations for the 2026–2027 season, exported from Paper.

- Original ten-slide deck: https://adnjkm.github.io/arcslides/
- Updated fifteen-slide deck: https://adnjkm.github.io/arcslides/new/
- Paper: https://app.paper.design/file/01M1SD0MFZ25RD9PR8Z3HV18KJ/1-0

## Local development

Run `npm ci`, `npm run build`, then `npm start`. Open http://localhost:4173.

On mobile, use the arrow buttons or swipe left/right. In fullscreen, controls fade after inactivity and reappear on a tap.

Use arrow keys or Space to advance and F or the fullscreen icon to expand the presentation. Escape exits expanded mode. Native fullscreen is used where supported, with a full-viewport fallback. Short directional transitions keep slide content visible, including during rapid navigation. Reduced motion and touch swipes are supported.

The updated deck includes per-slide speaking notes from `speaker-notes.json`. Open the separate speaker notes window with the script icon or S. On mobile, the notes icon opens presenter view in the same page; use Back to slides to close it. Mobile presenter view hides the next-slide preview. The desktop presenter view shows the current slide, an upcoming slide preview, and scrollable speaker notes. Everything stays synced with the current slide; use Previous/Next or the left/right arrow keys in the notes window to control the presentation. Escape in the notes window closes it. Slides without notes show an empty-state message.

`paper-export.json` contains the current Paper snapshot; `paper-export-original.json` preserves the previous deck. `build.mjs` creates the React slides and the static `docs/` site. Re-export Paper to incorporate design changes, then run `npm run build` and commit the updated files. GitHub Pages publishes `docs/` from `main`.

## Image sources

- Competition: https://aruw.org/news/four-time-robomaster-north-america-champions
- ARUW Standard: https://aruw.org/ourrobots
- Texas A&M robot: https://engineering.tamu.edu/news/2023/07/texas-am-robomasters-robotics-team-awarded-at-international-event.html
- Aaron Huang: https://www.aaronhuang.dev/
- Aiden Kim: https://www.linkedin.com/in/adnjkm/
- Evan Yu: https://evanyu.dev/
- Max Ma: https://www.linkedin.com/in/xiaoying-ma-6052a23a9/

Photographs belong to their respective owners.
