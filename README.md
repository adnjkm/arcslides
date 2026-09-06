# ARC Robotics slides

Ten-slide UTRA presentation for the 2026–2027 season, exported from Paper.

- Website: https://adnjkm.github.io/arcslides/
- Paper: https://app.paper.design/file/01M1SD0MFZ25RD9PR8Z3HV18KJ/1-0

## Local development

Run `npm ci`, `npm run build`, then `npm start`. Open http://localhost:4173.

Use arrow keys or Space to advance and F or the fullscreen icon to expand the presentation. Escape exits expanded mode. Native fullscreen is used where supported, with a full-viewport fallback. Short directional transitions keep slide content visible, including during rapid navigation. Reduced motion and touch swipes are supported.

`paper-export.json` contains the Paper snapshot. `build.mjs` creates the React slides and the static `docs/` site. Re-export Paper to incorporate design changes, then run `npm run build` and commit the updated files. GitHub Pages publishes `docs/` from `main`.

## Image sources

- Competition: https://aruw.org/news/four-time-robomaster-north-america-champions
- ARUW Standard: https://aruw.org/ourrobots
- Texas A&M robot: https://engineering.tamu.edu/news/2023/07/texas-am-robomasters-robotics-team-awarded-at-international-event.html
- Aaron Huang: https://www.linkedin.com/in/haaron/
- Aiden Kim: https://www.linkedin.com/in/adnjkm/
- Evan Yu: https://www.linkedin.com/in/ev-yu/
- Max Ma: https://www.linkedin.com/in/xiaoying-ma-6052a23a9/

Photographs belong to their respective owners.
