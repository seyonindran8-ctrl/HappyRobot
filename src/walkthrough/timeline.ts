import type { CaptionCue, SceneConfig } from '../config/gapOutreach';

export interface TimedScene extends SceneConfig {
  index: number;
  start: number;
  end: number;
  cues: CaptionCue[];
}

export interface Timeline {
  scenes: TimedScene[];
  duration: number;
}

/** Split narration into sentences, timed in proportion to word count. */
function autoCues(narration: string, duration: number): CaptionCue[] {
  const sentences = narration.match(/[^.!?]+[.!?]+["’”]?/g)?.map((s) => s.trim()) ?? [narration];
  const words = sentences.map((s) => s.split(/\s+/).length);
  const total = words.reduce((a, b) => a + b, 0);
  // Leave a short lead-in and tail so captions don't flash at scene edges.
  const lead = Math.min(0.4, duration * 0.05);
  const usable = duration - lead - 0.4;
  let at = lead;
  return sentences.map((text, i) => {
    const cue = { at, text };
    at += (words[i] / total) * usable;
    return cue;
  });
}

export function buildTimeline(scenes: SceneConfig[]): Timeline {
  let cursor = 0;
  const timed = scenes.map((scene, index) => {
    const start = cursor;
    cursor += scene.duration;
    return {
      ...scene,
      index,
      start,
      end: cursor,
      cues: scene.cues ?? autoCues(scene.narration, scene.duration),
    };
  });
  return { scenes: timed, duration: cursor };
}

export function sceneAt(timeline: Timeline, t: number): TimedScene {
  const { scenes } = timeline;
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (t >= scenes[i].start) return scenes[i];
  }
  return scenes[0];
}

export function captionAt(timeline: Timeline, t: number): string {
  const scene = sceneAt(timeline, t);
  const local = t - scene.start;
  let text = '';
  for (const cue of scene.cues) if (local >= cue.at) text = cue.text;
  return text;
}

/** Absolute time of a named beat, e.g. beatTime(tl, 'eta', 'carrierReplies'). */
export function beatTime(timeline: Timeline, sceneId: string, beat: string): number {
  const scene = timeline.scenes.find((s) => s.id === sceneId);
  const offset = scene?.beats[beat];
  if (!scene || offset === undefined) {
    throw new Error(`Unknown beat "${sceneId}.${beat}" — check the walkthrough config.`);
  }
  return scene.start + offset;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
