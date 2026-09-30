import { useEffect, useRef, useState } from 'react';
import { outreach } from '../config/gapOutreach';

const { openingVideo } = outreach.media;

/** Seconds before the clip's end where the held final frame is parked. */
const HOLD_OFFSET = 0.04;

interface Props {
  /** Seconds since the start of the walkthrough. */
  time: number;
  duration: number;
  playing: boolean;
  reducedMotion: boolean;
}

/**
 * Backdrop behind the whole walkthrough: the opening footage plays once from
 * the start, then holds its final frame behind the workflow scenes. The clip
 * is slaved to the playback clock, so pause, seek, replay and scene navigation
 * always show the right frame. If the video can't load, or the viewer prefers
 * reduced motion, the final frame is shown as a still.
 */
export function Backdrop({ time, duration, playing, reducedMotion }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [clipLength, setClipLength] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideo = openingVideo.enabled && !videoFailed && !reducedMotion;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo || clipLength === null) return;
    const hold = clipLength - HOLD_OFFSET;
    if (time >= hold) {
      // Past the clip: park on the final frame.
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - hold) > 0.1) v.currentTime = hold;
      return;
    }
    if (Math.abs(v.currentTime - time) > 0.3) v.currentTime = time;
    if (playing && v.paused) v.play().catch(() => undefined);
    if (!playing && !v.paused) v.pause();
  }, [time, playing, useVideo, clipLength]);

  // A slow push-in across the whole walkthrough, derived from the clock.
  const scale = reducedMotion ? 1.02 : 1.02 + Math.min(time / duration, 1) * 0.06;

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-media" style={{ transform: `scale(${scale})` }}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="backdrop-video"
            poster={openingVideo.still}
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
