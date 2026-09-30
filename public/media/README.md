# Optional media

Drop the supplied files here, then set `enabled: true` for each in
`src/config/gapOutreach.ts` (`media.openingVideo` / `media.narration`).

- `gap-dc-opening.mp4` — opening clip for scene 1 (muted, kept in step with the playback clock; ~12 s).
- `gap-narration.mp3` — full narration. When enabled, its playback time drives the whole walkthrough.

Disabled media is never requested. An enabled file that fails to load is
requested once, then the page falls back to the illustration / internal clock.
