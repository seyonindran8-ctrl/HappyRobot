import { useEffect, useRef, useState } from 'react';
import { outreach } from '../config/gapOutreach';

const { openingVideo } = outreach.media;

/** Beyond this gap from the clock (seconds), jump the video; below it, nudge its speed. */
const SEEK_THRESHOLD = 0.5;
/** Gaps smaller than this are left alone. */
const DRIFT_TOLERANCE = 0.12;

/** Push-in: an eased zoom through the opening, then a gentle drift for the rest. */
const ZOOM_OPENING = 0.06;
const ZOOM_REST = 0.03;

function pushIn(time: number, openingEnd: number, duration: number): number {
  if (time <= openingEnd) {
    const p = Math.max(time, 0) / openingEnd;
    // Ease-out: moving from the first frame, settling as the opening ends.
    return 1 + ZOOM_OPENING * Math.sin((p * Math.PI) / 2);
  }
  const p = Math.min((time - openingEnd) / (duration - openingEnd), 1);
  return 1 + ZOOM_OPENING + ZOOM_REST * p;
}

interface Props {
  /** Seconds since the start of the walkthrough (0 before Play is pressed). */
  time: number;
  /** When the opening scene ends; the push-in eases out by then. */
  openingEnd: number;
  duration: number;
  playing: boolean;
  reducedMotion: boolean;
}

/**
 * Backdrop behind the whole walkthrough: the opening footage plays once from
 * the start, then holds its final frame behind the workflow scenes.
 *
 * The clip follows the playback clock without fighting it. While playing,
 * small drift is corrected by nudging playbackRate, and the clip is left to
 * run out to its own final frame. It only seeks when the viewer seeks,
 * navigates or replays (or drift grows past SEEK_THRESHOLD). If the video
 * can't load, or the viewer prefers reduced motion, the final frame is shown
 * as a still.
 */
export function Backdrop({ time, openingEnd, duration, playing, reducedMotion }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [clipLength, setClipLength] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideo = openingVideo.enabled && !videoFailed && !reducedMotion;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo || clipLength === null) return;
    const end = clipLength - 0.02;

    if (time >= end) {
      // Past the clip. If it is still running out, let it finish on its own;
      // otherwise (paused, or arrived here by seeking) park on the last frame.
      if (!v.paused && !v.ended && playing && end - v.currentTime < SEEK_THRESHOLD) return;
      if (!v.paused) v.pause();
      v.playbackRate = 1;
      if (Math.abs(v.currentTime - end) > 0.05 && !v.seeking) v.currentTime = end;
      return;
    }

    // The clip can finish a moment before the clock does. A finished video
    // restarts from 0 if told to play, so just hold its final frame.
    if (playing && (v.ended || v.currentTime >= end) && end - time < SEEK_THRESHOLD) return;

    const drift = v.currentTime - time;
    if (!playing) {
      if (!v.paused) v.pause();
      v.playbackRate = 1;
      if (Math.abs(drift) > DRIFT_TOLERANCE && !v.seeking) v.currentTime = time;
      return;
    }

    if (Math.abs(drift) > SEEK_THRESHOLD) {
      if (!v.seeking) v.currentTime = time;
      v.playbackRate = 1;
    } else if (Math.abs(drift) > DRIFT_TOLERANCE) {
      // Behind: speed up a touch; ahead: slow down a touch.
      v.playbackRate = drift < 0 ? 1.08 : 0.92;
    } else if (v.playbackRate !== 1) {
      v.playbackRate = 1;
    }
    if (v.paused || v.ended) v.play().catch(() => undefined);
  }, [time, playing, useVideo, clipLength]);

  const scale = reducedMotion ? 1 : pushIn(time, openingEnd, duration);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-media" style={{ transform: `scale3d(${scale}, ${scale}, 1)` }}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="backdrop-video"
            poster={openingVideo.poster}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            onLoadedMetadata={(e) => setClipLength(e.currentTarget.duration)}
          >
            {openingVideo.sources.map((source, i) => (
              <source
                key={source.type}
                src={source.src}
                type={source.type}
                // The browser tries sources in order; an error on the last one
                // means none could be played.
                onError={i === openingVideo.sources.length - 1 ? () => setVideoFailed(true) : undefined}
              />
            ))}
          </video>
        ) : (
          <img className="backdrop-still" src={openingVideo.still} alt="" />
        )}
      </div>
    </div>
  );
}
