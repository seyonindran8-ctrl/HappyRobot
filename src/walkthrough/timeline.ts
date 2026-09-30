import type { CaptionCue, SceneConfig } from '../config/gapOutreach';

export interface TimedScene extends SceneConfig {
  index: number;
  start: number;
  end: number;
  duration: number;
  cues: CaptionCue[];
}

export interface Timeline {
  scenes: TimedScene[];
  duration: number;
  /** Every caption cue in order, in seconds from the start. */
  cues: CaptionCue[];
}

/** Split narration into sentences, timed in proportion to word count. */
function autoCues(narration: string, start: number, duration: number): CaptionCue[] {
  const sentences = narration.match(/[^.!?]+[.!?]+["’”]?/g)?.map((s) => s.trim()) ?? [narration];
  const words = sentences.map((s) => s.split(/\s+/).length);
  const total = words.reduce((a, b) => a + b, 0);
  const lead = Math.min(0.4, duration * 0.05);
  const usable = duration - lead - 0.4;
  let at = start + lead;
  return sentences.map((text, i) => {
    const cue = { at, text };
    at += (words[i] / total) * usable;
    return cue;
  });
}

export function buildTimeline(scenes: SceneConfig[], duration: number): Timeline {
  const timed = scenes.map((scene, index) => {
    const end = index + 1 < scenes.length ? scenes[index + 1].start : duration;
    const cues = scene.cues ?? autoCues(scene.narration, scene.start, end - scene.start);
    if (import.meta.env.DEV) {
      const joined = cues.map((c) => c.text).join(' ');
      if (joined !== scene.narration) console.warn(`Captions for "${scene.id}" don't match its narration word for word.`);
      for (const [beat, at] of Object.entries(scene.beats)) {
        if (at < scene.start || at >= end) console.warn(`Beat "${scene.id}.${beat}" (${at}s) falls outside its scene.`);
      }
    }
    return { ...scene, index, end, duration: end - scene.start, cues };
  });
  return { scenes: timed, duration, cues: timed.flatMap((s) => s.cues) };
}

export function sceneAt(timeline: Timeline, t: number): TimedScene {
  const { scenes } = timeline;
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (t >= scenes[i].start) return scenes[i];
  }
  return scenes[0];
}

export function captionAt(timeline: Timeline, t: number): string {
  let text = '';
  for (const cue of timeline.cues) {
    if (t >= cue.at) text = cue.text;
    else break;
  }
  return text;
}

/** Time of a named beat, e.g. beatTime(tl, 'eta', 'carrierReplies'). */
export function beatTime(timeline: Timeline, sceneId: string, beat: string): number {
  const at = timeline.scenes.find((s) => s.id === sceneId)?.beats[beat];
  if (at === undefined) {
    throw new Error(`Unknown beat "${sceneId}.${beat}" — check the walkthrough config.`);
  }
  return at;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
