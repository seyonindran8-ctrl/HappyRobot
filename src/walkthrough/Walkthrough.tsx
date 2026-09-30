import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { outreach } from '../config/gapOutreach';
import { buildTimeline, captionAt, formatTime, sceneAt } from './timeline';
import { usePlaybackClock } from './usePlaybackClock';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { Stage } from './Stage';

const { walkthrough, media, page, attribution } = outreach;
const base = import.meta.env.BASE_URL;

export function Walkthrough() {
  const timeline = useMemo(() => buildTimeline(walkthrough.scenes), []);
  const reducedMotion = usePrefersReducedMotion();

  // Narration is only mounted when enabled, and removed for good if it fails,
  // so a missing file costs at most one request.
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);
  const narrationOn = media.narration.enabled && !audioFailed;
  const [audioReady, setAudioReady] = useState(false);

  const clock = usePlaybackClock(timeline.duration, narrationOn && audioReady ? audioEl : null);
  const { time, playing, toggle, seek, play } = clock;

  const [started, setStarted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);

  const scene = sceneAt(timeline, time);
  const caption = captionAt(timeline, time);
  const ended = time >= timeline.duration - 0.01;

  useEffect(() => {
    if (playing) setStarted(true);
  }, [playing]);

  const start = () => {
    setStarted(true);
    play();
  };

  const goToScene = (index: number) => {
    const target = timeline.scenes[Math.min(Math.max(index, 0), timeline.scenes.length - 1)];
    seek(target.start);
    if (!started) start();
  };

  const replay = () => {
    seek(0);
    start();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const onButton = target.tagName === 'BUTTON';
    const onRange = target.tagName === 'INPUT';
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        if (onButton && e.key === ' ') return; // native button activation
        e.preventDefault();
        if (!started) start();
        else toggle();
        break;
      case 'ArrowLeft':
        if (onRange) return;
        e.preventDefault();
        seek(time - 5);
        break;
      case 'ArrowRight':
        if (onRange) return;
        e.preventDefault();
        seek(time + 5);
        break;
      case 'n':
      case 'N':
      case ']':
        e.preventDefault();
        goToScene(scene.index + 1);
        break;
      case 'p':
      case 'P':
      case '[':
        e.preventDefault();
        // Like a media player: jump to the start of this scene, or the previous one if already near it.
        goToScene(time - scene.start > 1.5 ? scene.index : scene.index - 1);
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        setCaptionsOn((on) => !on);
        break;
      case 'Home':
        if (onRange) return;
        e.preventDefault();
        seek(0);
        break;
      case 'End':
        if (onRange) return;
        e.preventDefault();
        seek(timeline.duration);
        break;
    }
  };

  const stageTime = started ? time : walkthrough.posterTime;

  return (
    <div className="player" onKeyDown={onKeyDown} aria-label="Illustrative walkthrough" role="region">
      {narrationOn && (
        <audio
          ref={setAudioEl}
          src={base + media.narration.src}
          preload="auto"
          onLoadedMetadata={() => setAudioReady(true)}
          onError={() => setAudioFailed(true)}
        />
      )}

      <div className="player-frame">
        <div className="player-label">
          <span>{page.walkthroughLabel}</span>
        </div>

        <div className={`player-stage ${started ? '' : 'is-poster'}`}>
          <Stage timeline={timeline} time={stageTime} playing={playing} reducedMotion={reducedMotion} />

          {!started && (
            <div className="poster">
              <div className="poster-inner">
                <p className="poster-kicker">Walkthrough · {formatTime(timeline.duration)} · Captions on</p>
                <p className="poster-title">From a missed unloading slot to a confirmed appointment</p>
                <button type="button" className="poster-play" onClick={start}>
                  <PlayIcon />
                  <span>Play walkthrough</span>
                </button>
                <p className="poster-hint">
                  No sound needed · {attribution.author ? `Unofficial concept by ${attribution.author}` : 'Unofficial concept'}
                </p>
              </div>
            </div>
          )}
        </div>

        {captionsOn && (
          <div className="captions" aria-live={playing ? 'off' : 'polite'}>
            <p className={`caption ${started ? '' : 'is-hint'}`}>{started ? caption || '\u00a0' : 'Captions appear here as the walkthrough plays.'}</p>
          </div>
        )}

        <div className="controls">
          <button
            type="button"
            className="ctl ctl-primary"
            onClick={started ? (ended ? replay : toggle) : start}
            aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
          >
            {playing ? <PauseIcon /> : ended ? <ReplayIcon /> : <PlayIcon />}
          </button>
          <button type="button" className="ctl" onClick={replay} aria-label="Replay from start" title="Replay from start">
            <ReplayIcon />
          </button>

          <div className="progress">
            <input
              type="range"
              min={0}
              max={timeline.duration}
              step={0.1}
              value={time}
              onChange={(e) => {
                if (!started) setStarted(true);
                seek(Number(e.target.value));
              }}
              aria-label="Seek"
              aria-valuetext={`${formatTime(time)} of ${formatTime(timeline.duration)}, ${scene.title}`}
              style={{ ['--pct' as string]: `${(time / timeline.duration) * 100}%` }}
            />
            <div className="progress-ticks" aria-hidden="true">
              {timeline.scenes.slice(1).map((s) => (
                <span key={s.id} style={{ left: `${(s.start / timeline.duration) * 100}%` }} />
              ))}
            </div>
          </div>

          <span className="time mono" aria-hidden="true">
            {formatTime(time)} / {formatTime(timeline.duration)}
          </span>

          <button
            type="button"
            className={`ctl ctl-text ${captionsOn ? 'is-on' : ''}`}
            onClick={() => setCaptionsOn((on) => !on)}
            aria-pressed={captionsOn}
            title="Captions (C)"
          >
            CC
          </button>
        </div>

        <nav className="chapters" aria-label="Scenes">
          {timeline.scenes.map((s) => {
            const active = started && s.index === scene.index;
            return (
              <button
                key={s.id}
                type="button"
                className={`chapter ${active ? 'is-active' : ''} ${started && s.index < scene.index ? 'is-past' : ''}`}
                onClick={() => goToScene(s.index)}
                aria-current={active ? 'step' : undefined}
              >
                <span className="chapter-num mono">{String(s.index + 1).padStart(2, '0')}</span>
                <span className="chapter-title">{s.title}</span>
                <span className="chapter-time mono">{formatTime(s.start)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <p className="player-keys">
        Keyboard: <kbd>Space</kbd> play/pause · <kbd>←</kbd> <kbd>→</kbd> 5 s · <kbd>[</kbd> <kbd>]</kbd> scenes · <kbd>C</kbd> captions
      </p>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M6 4.2v11.6a.6.6 0 0 0 .9.5l9.2-5.8a.6.6 0 0 0 0-1L6.9 3.7a.6.6 0 0 0-.9.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
      <rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M4.5 10a5.5 5.5 0 1 0 1.7-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.6 2.8v3.6h3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
