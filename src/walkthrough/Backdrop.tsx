import { useEffect, useRef, useState } from 'react';
import { outreach } from '../config/gapOutreach';

const { media } = outreach;
const base = import.meta.env.BASE_URL;

interface Props {
  /** Seconds since the start of the walkthrough. */
  time: number;
  duration: number;
  playing: boolean;
  reducedMotion: boolean;
}

/**
 * Backdrop behind the whole walkthrough. Uses the supplied opening clip when
 * enabled in config and it loads; otherwise an illustrated distribution-centre
 * placeholder. The clip is kept in step with the playback clock and holds its
 * last frame once it ends, so later scenes sit on top of it.
 */
export function Backdrop({ time, duration, playing, reducedMotion }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideo = media.openingVideo.enabled && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo) return;
    const end = Number.isFinite(v.duration) ? v.duration : Infinity;
    const target = Math.min(time, end);
    if (Math.abs(v.currentTime - target) > 0.35) v.currentTime = target;
    const shouldPlay = playing && time < end;
    if (shouldPlay && v.paused) v.play().catch(() => undefined);
    if (!shouldPlay && !v.paused) v.pause();
  }, [time, playing, useVideo]);

  // A slow push-in across the whole walkthrough, derived from the clock.
  const scale = reducedMotion ? 1.02 : 1.02 + Math.min(time / duration, 1) * 0.06;

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-media" style={{ transform: `scale(${scale})` }}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="backdrop-video"
            src={base + media.openingVideo.src}
            muted
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <DistributionCentreIllustration />
        )}
      </div>
    </div>
  );
}

function DistributionCentreIllustration() {
  const doors = Array.from({ length: 11 }, (_, i) => i);
  const lit = new Set([1, 2, 4, 7, 8, 10]);
  const trailers = new Set([1, 4, 7, 10]);
  const openDoor = 5; // the empty 10:00 slot
  return (
    <svg className="backdrop-illustration" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2520" />
          <stop offset="0.45" stopColor="#56412f" />
          <stop offset="0.72" stopColor="#a8714a" />
          <stop offset="0.8" stopColor="#d49a68" />
        </linearGradient>
        <linearGradient id="apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#332a22" />
          <stop offset="1" stopColor="#1a1511" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#473a2f" />
          <stop offset="1" stopColor="#332a22" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe2bd" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffe2bd" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7d3a4" />
          <stop offset="1" stopColor="#d19460" />
        </linearGradient>
        <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efbd88" stopOpacity="0.3" />
          <stop offset="1" stopColor="#efbd88" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      <path d="M0 470 Q200 452 380 466 T760 460 T1140 468 T1600 458 L1600 520 L0 520 Z" fill="#2c231d" opacity="0.9" />

      <rect x="120" y="360" width="1380" height="300" fill="url(#wall)" />
      <rect x="120" y="352" width="1380" height="12" fill="#58493d" />
      {Array.from({ length: 23 }, (_, i) => (
        <line key={i} x1={120 + i * 60} y1="364" x2={120 + i * 60} y2="470" stroke="#3a3027" strokeWidth="2" />
      ))}

      {doors.map((i) => {
        const x = 190 + i * 118;
        const isLit = lit.has(i) || i === openDoor;
        return (
          <g key={i}>
            <rect x={x - 6} y="492" width="92" height="138" fill="#271f19" />
            <rect x={x} y="500" width="80" height="124" fill={isLit ? 'url(#doorGlow)' : '#1f1914'} opacity={isLit ? 0.92 : 1} />
            {!isLit &&
              Array.from({ length: 6 }, (_, k) => (
                <line key={k} x1={x} y1={512 + k * 19} x2={x + 80} y2={512 + k * 19} stroke="#2c241e" strokeWidth="2" />
              ))}
            {isLit && <path d={`M${x} 632 L${x + 80} 632 L${x + 120} 760 L${x - 40} 760 Z`} fill="url(#spill)" />}
          </g>
        );
      })}

      <rect x="0" y="630" width="1600" height="270" fill="url(#apron)" />
      {doors.map((i) => {
        const x = 230 + i * 118;
        return <line key={i} x1={x - 58} y1="640" x2={(x - 800) * 1.7 + 800 - 58} y2="900" stroke="#43372d" strokeWidth="2" />;
      })}

      {doors
        .filter((i) => trailers.has(i))
        .map((i) => {
          const x = 190 + i * 118;
          return (
            <g key={i}>
              <path d={`M${x - 4} 520 L${x + 84} 520 L${x + 112} 760 L${x - 32} 760 Z`} fill="#453a31" />
              <path d={`M${x - 4} 520 L${x + 84} 520 L${x + 86} 540 L${x - 6} 540 Z`} fill="#56493e" />
              <rect x={x - 26} y="738" width="18" height="10" fill="#c0512f" opacity="0.85" />
              <rect x={x + 88} y="738" width="18" height="10" fill="#c0512f" opacity="0.85" />
            </g>
          );
        })}

      <rect x={190 + openDoor * 118 - 10} y="488" width="100" height="146" fill="none" stroke="#f5cc98" strokeWidth="2" strokeDasharray="6 6" opacity="0.85" />

      {[160, 560, 980, 1400].map((x) => (
        <g key={x}>
          <circle cx={x} cy="300" r="120" fill="url(#lamp)" />
          <rect x={x - 2} y="300" width="4" height="340" fill="#1f1914" />
          <rect x={x - 14} y="294" width="28" height="8" rx="2" fill="#fae3c2" />
        </g>
      ))}
    </svg>
  );
}
