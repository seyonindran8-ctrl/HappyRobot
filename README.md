# Gap supply-chain outreach — illustrative walkthrough

A single responsive page (React + TypeScript + Vite) showing an illustrative
HappyRobot-style workflow for carrier delay coordination. All shipment data is
fictional; this is a concept, not a live integration or official demo.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build on http://localhost:4173
```

## Where things live

| What | Where |
| --- | --- |
| Page copy, fictional shipment, source links, narration, scene timings, media flags | `src/config/gapOutreach.ts` |
| Playback clock (audio-driven or internal) | `src/walkthrough/usePlaybackClock.ts` |
| Timeline maths (scene starts, caption cues, beats) | `src/walkthrough/timeline.ts` |
| Walkthrough visuals (pure function of time) | `src/walkthrough/Stage.tsx`, `OpeningScene.tsx` |
| Player chrome: poster, captions, controls, chapters, keyboard | `src/walkthrough/Walkthrough.tsx` |
| Styles / design tokens | `src/styles.css` |

### Adjusting timings after narration

Each scene has a `duration`; start times are derived, so changing one shifts
everything after it. `beats` are offsets from the start of their scene and
control when each visual change happens. Captions are split by sentence and
timed by word count automatically; add a `cues` array to a scene to time them
by hand.

### Adding media

See `public/media/README.md`. Put `gap-dc-opening.mp4` and `gap-narration.mp3`
in `public/media/` and flip `enabled` to `true` in the config.

## Keyboard

Space / K play-pause · ← → seek 5 s · [ ] previous / next scene · C captions ·
Home / End.
