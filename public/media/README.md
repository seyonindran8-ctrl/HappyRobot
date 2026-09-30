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

## Opening footage (in use)

The opening clip (5.04 s) lives in `src/media/` and is imported by the config:

- `gap-dc-opening.webm` (VP9) and `gap-dc-opening.mp4` (H.264), both
  1600×900, muted, re-encoded from the supplied 10-bit HEVC master, which
  many browsers can't decode.
- `gap-dc-final-frame.jpg`: the clip's final frame. Shown as a still if the
  video can't load, and in place of the video for viewers who prefer reduced
  motion.

It starts when Play is pressed, plays once, then holds its final frame behind
the workflow scenes. It follows the playback clock, so pause, seek, replay
and scene navigation always show the right frame.

To replace it, re-encode the new master the same way (from this repo's root):

    ffmpeg -i master.mp4 -an -vf "scale=1600:900:flags=lanczos,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 src/media/gap-dc-opening.webm
    ffmpeg -i master.mp4 -an -vf "scale=1600:900:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 20 -movflags +faststart src/media/gap-dc-opening.mp4
    ffmpeg -sseof -0.05 -i master.mp4 -vf "scale=1600:900" -update 1 -q:v 4 src/media/gap-dc-final-frame.jpg
