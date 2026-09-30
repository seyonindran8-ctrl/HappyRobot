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

## Deploying

`netlify.toml` deploys the walkthrough to `/gap-walkthrough/` on Netlify
(`npm run build:site` builds it into `dist-site/`). See [DEPLOY.md](DEPLOY.md)
for putting it at seyonindran.com/gap-walkthrough.

## Where things live

| What | Where |
| --- | --- |
| Page copy, fictional shipment, source links, narration, scene timings, media flags | `src/config/gapOutreach.ts` |
| Playback clock (audio-driven or internal) | `src/walkthrough/usePlaybackClock.ts` |
| Timeline maths (scene starts, caption cues, beats) | `src/walkthrough/timeline.ts` |
| Walkthrough visuals (pure function of time) | `src/walkthrough/Stage.tsx`, `Backdrop.tsx` |
| Player chrome: poster, captions, controls, chapters, keyboard | `src/walkthrough/Walkthrough.tsx` |
| Styles / design tokens | `src/styles.css` |

### Adjusting timings after narration

Scene starts, caption cues and beats are all seconds from the start of the
narration audio, so each can be checked against the waveform. `beats` are the
moments when visual changes happen. In development, the page warns if a
scene's captions stop matching its narration word for word, or if a beat
falls outside its scene.

### Adding media

The narration and opening footage live in `src/media/` and are switched on in
the config's `media` section. See `public/media/README.md` for how they play
and how to replace them.

## Keyboard

Space / K play-pause · ← → seek 5 s · [ ] previous / next scene · C captions · M sound ·
Home / End.
