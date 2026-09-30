import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The single playback clock for the walkthrough. Every visual is derived
 * from `time`, so pausing and seeking always leave the page in the correct
 * state.
 *
 * With narration enabled and loaded, the audio element's currentTime drives
 * the clock. Otherwise (or if the audio fails, or runs shorter than the
 * configured timeline) an internal requestAnimationFrame clock uses the same
 * scene timings.
 */
export function usePlaybackClock(duration: number, audio: HTMLAudioElement | null) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef(0);
  const playingRef = useRef(false);

  const audioCovers = (t: number) =>
    !!audio && Number.isFinite(audio.duration) && t < audio.duration - 0.05;

  const commit = (t: number) => {
    timeRef.current = t;
    setTime(t);
  };

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    audio?.pause();
  }, [audio]);

  const play = useCallback(() => {
    let t = timeRef.current;
    if (t >= duration - 0.01) {
      t = 0;
      commit(0);
    }
    playingRef.current = true;
    setPlaying(true);
    if (audio && audioCovers(t)) {
      audio.currentTime = t;
      // If the browser refuses playback, the internal clock simply continues.
      audio.play().catch(() => undefined);
    }
  }, [audio, duration]);

  const seek = useCallback(
    (target: number) => {
      const t = Math.min(Math.max(target, 0), duration);
      commit(t);
      if (audio) {
        if (audioCovers(t)) {
          audio.currentTime = t;
          if (playingRef.current && audio.paused) audio.play().catch(() => undefined);
        } else {
          audio.pause();
        }
      }
    },
    [audio, duration],
  );

  const toggle = useCallback(() => (playingRef.current ? pause() : play()), [pause, play]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamp so a backgrounded tab doesn't jump ahead on return.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      let t: number;
      if (audio && !audio.paused && !audio.ended && audioCovers(timeRef.current)) {
        t = audio.currentTime;
      } else {
        t = timeRef.current + dt;
      }
      if (t >= duration) {
        commit(duration);
        playingRef.current = false;
        setPlaying(false);
        audio?.pause();
        return;
      }
      commit(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, audio, duration]);

  return { time, playing, play, pause, toggle, seek };
}
