# Optional media

## Narration (in use)

The ElevenLabs narration lives at `src/media/gap-narration.mp3` and is
imported by `src/config/gapOutreach.ts`, so every build bundles it (the
shareable single-file build embeds it). When `media.narration.enabled` is
true, its playback time drives the walkthrough; the Sound button mutes it
without breaking sync.

Scene starts, caption cues and beats in the config are seconds from the start
of this audio file. To replace the narration, swap the file and re-time those
values against it.

## Opening footage (not yet supplied)

Drop `gap-dc-opening.mp4` in this folder and set `media.openingVideo.enabled`
to `true`. It plays muted behind scene 1, kept in step with the playback
clock, and holds its last frame as the backdrop for scenes 2–4. Until then,
the illustrated distribution centre is shown. A missing file is requested
once, then the page falls back to the illustration.
