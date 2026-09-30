import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { outreach } from '../config/gapOutreach';

const { openingVideo } = outreach.media;

/** Beyond this gap from the clock (seconds), jump the video; below it, nudge its speed. */
const SEEK_THRESHOLD = 0.5;
/** Gaps smaller than this are left alone. */
const DRIFT_TOLERANCE = 0.12;

/** Push-in: an eased zoom through the opening, then a gentle drift for the rest. */
const ZOOM_OPENING = 0.06;
const ZOOM_REST = 0.03;
/** Re-align the push-in with the clock only when it strays further than this (seconds). */
const ZOOM_RESYNC = 0.25;

/**
 * The push-in runs as a Web Animation so the browser advances it smoothly
 * every frame. Driving it from the narration clock made it step unevenly,
 * because an audio element's currentTime only updates in irregular chunks.
 * The animation is kept in line with the clock: it plays and pauses with
 * playback and is re-aligned on seeks, scene jumps and replay.
 */
function usePushIn(
  ref: React.RefObject<HTMLDivElement>,
  time: number,
  openingEnd: number,
  duration: number,
  playing: boolean,
  reducedMotion: boolean,
) {
  const anim = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const s = (v: number) => `scale3d(${v}, ${v}, 1)`;
    const a = el.animate(
      [
        // Ease-out (sine) through the opening: moving from the first frame, settling as it ends.
        { transform: s(1), easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)' },
        { transform: s(1 + ZOOM_OPENING), offset: openingEnd / duration, easing: 'linear' },
        { transform: s(1 + ZOOM_OPENING + ZOOM_REST) },
      ],
      { duration: duration * 1000, fill: 'both' },
    );
    a.pause();
    anim.current = a;
    return () => {
      a.cancel();
      anim.current = null;
    };
  }, [ref, openingEnd, duration, reducedMotion]);

  useEffect(() => {
    const a = anim.current;
    if (!a) return;
    const current = (Number(a.currentTime) || 0) / 1000;
    if (Math.abs(current - time) > ZOOM_RESYNC || !playing) a.currentTime = time * 1000;
    if (playing && time < duration) {
      if (a.playState !== 'running') a.play();
    } else if (a.playState === 'running') {
      a.pause();
    }
  }, [time, playing, duration]);
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
  const mediaRef = useRef<HTMLDivElement>(null);
  // The poster image only covers loading; once the first frame is decoded the
  // video shows it itself, so pressing Play doesn't swap image for video.
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const useVideo = openingVideo.enabled && !videoFailed && !reducedMotion;

  usePushIn(mediaRef, time, openingEnd, duration, playing, reducedMotion);

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

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-media" ref={mediaRef}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="backdrop-video"
            poster={firstFrameReady ? undefined : openingVideo.poster}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            onLoadedMetadata={(e) => setClipLength(e.currentTarget.duration)}
            onLoadedData={() => setFirstFrameReady(true)}
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
