import { useEffect, useRef, useState } from 'react';
import { outreach } from '../config/gapOutreach';

const { shipment, media } = outreach;
const base = import.meta.env.BASE_URL;

interface Props {
  /** Seconds since the start of the opening scene. */
  local: number;
  sceneDuration: number;
  playing: boolean;
  active: boolean;
  showNotification: boolean;
  reducedMotion: boolean;
}

/**
 * Opening "footage". Uses the supplied clip when enabled in config and it
 * loads; otherwise an illustrated distribution-centre placeholder. The clip is
 * kept in step with the playback clock rather than playing freely.
 */
export function OpeningScene({ local, sceneDuration, playing, active, showNotification, reducedMotion }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideo = media.openingVideo.enabled && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo) return;
    const target = Math.min(local, Number.isFinite(v.duration) ? v.duration : local);
    if (Math.abs(v.currentTime - target) > 0.35) v.currentTime = target;
    const shouldPlay = playing && active && local < v.duration;
    if (shouldPlay && v.paused) v.play().catch(() => undefined);
    if (!shouldPlay && !v.paused) v.pause();
  }, [local, playing, active, useVideo]);

  const progress = Math.min(Math.max(local / sceneDuration, 0), 1);
  const scale = reducedMotion ? 1 : 1.02 + progress * 0.05;

  return (
    <div className="opening">
      <div className="opening-media" style={{ transform: `scale(${scale})` }}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="opening-video"
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
      <div className="opening-vignette" aria-hidden="true" />

      <div className="opening-lower-third">
        <span className="opening-place">{shipment.location}</span>
        <span className="opening-clock">09:12</span>
      </div>

      <div className={`notification ${showNotification ? 'is-in' : ''}`} role="status">
        <div className="notification-head">
          <span className="notification-dot" aria-hidden="true" />
          Arrival delayed
        </div>
        <div className="notification-body">
          <span className="mono">{shipment.id}</span> · {shipment.carrier}
        </div>
        <div className="notification-meta">
          Unloading appointment {shipment.originalAppointment} · likely to be missed
        </div>
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
    <svg
      className="opening-illustration"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration of a distribution centre loading dock at dusk"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#201a16" />
          <stop offset="0.45" stopColor="#4a3527" />
          <stop offset="0.72" stopColor="#9a6440" />
          <stop offset="0.8" stopColor="#c4895a" />
        </linearGradient>
        <linearGradient id="apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a221c" />
          <stop offset="1" stopColor="#15110e" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f27" />
          <stop offset="1" stopColor="#2a221c" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd8a8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd8a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3c793" />
          <stop offset="1" stopColor="#c98a57" />
        </linearGradient>
        <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7b07a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e7b07a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      {/* Distant tree line / horizon */}
      <path d="M0 470 Q200 452 380 466 T760 460 T1140 468 T1600 458 L1600 520 L0 520 Z" fill="#241c17" opacity="0.9" />

      {/* Building */}
      <rect x="120" y="360" width="1380" height="300" fill="url(#wall)" />
      <rect x="120" y="352" width="1380" height="12" fill="#4a3d33" />
      {Array.from({ length: 23 }, (_, i) => (
        <line key={i} x1={120 + i * 60} y1="364" x2={120 + i * 60} y2="470" stroke="#2c241e" strokeWidth="2" />
      ))}

      {/* Dock doors */}
      {doors.map((i) => {
        const x = 190 + i * 118;
        const isLit = lit.has(i) || i === openDoor;
        return (
          <g key={i}>
            <rect x={x - 6} y="492" width="92" height="138" fill="#1f1914" />
            <rect x={x} y="500" width="80" height="124" fill={isLit ? 'url(#doorGlow)' : '#191410'} opacity={isLit ? 0.9 : 1} />
            {!isLit && Array.from({ length: 6 }, (_, k) => (
              <line key={k} x1={x} y1={512 + k * 19} x2={x + 80} y2={512 + k * 19} stroke="#241d18" strokeWidth="2" />
            ))}
            {isLit && <path d={`M${x} 632 L${x + 80} 632 L${x + 120} 760 L${x - 40} 760 Z`} fill="url(#spill)" />}
            <rect x={x + 30} y="470" width="20" height="14" rx="2" fill="#2e261f" />
            <text x={x + 40} y="481" textAnchor="middle" fontSize="10" fill="#8a7666" fontFamily="Inter Variable, sans-serif">
              {String(i + 10)}
            </text>
          </g>
        );
      })}

      {/* Apron */}
      <rect x="0" y="630" width="1600" height="270" fill="url(#apron)" />
      {doors.map((i) => {
        const x = 230 + i * 118;
        return <line key={i} x1={x - 58} y1="640" x2={(x - 800) * 1.7 + 800 - 58} y2="900" stroke="#3a3027" strokeWidth="2" />;
      })}

      {/* Trailers backed onto doors */}
      {doors
        .filter((i) => trailers.has(i))
        .map((i) => {
          const x = 190 + i * 118;
          return (
            <g key={i}>
              <path d={`M${x - 4} 520 L${x + 84} 520 L${x + 112} 760 L${x - 32} 760 Z`} fill="#3b3129" />
              <path d={`M${x - 4} 520 L${x + 84} 520 L${x + 86} 540 L${x - 6} 540 Z`} fill="#4b3f35" />
              <rect x={x - 26} y="738" width="18" height="10" fill="#b24a2c" opacity="0.85" />
              <rect x={x + 88} y="738" width="18" height="10" fill="#b24a2c" opacity="0.85" />
            </g>
          );
        })}

      {/* The empty appointment slot */}
      <g>
        <rect x={190 + openDoor * 118 - 10} y="488" width="100" height="146" fill="none" stroke="#f0c28f" strokeWidth="2" strokeDasharray="6 6" opacity="0.8" />
      </g>

      {/* Yard lights */}
      {[160, 560, 980, 1400].map((x) => (
        <g key={x}>
          <circle cx={x} cy="300" r="120" fill="url(#lamp)" />
          <rect x={x - 2} y="300" width="4" height="340" fill="#1a1512" />
          <rect x={x - 14} y="294" width="28" height="8" rx="2" fill="#f7dcb6" />
        </g>
      ))}
    </svg>
  );
}
