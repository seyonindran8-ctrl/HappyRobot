/**
 * Account configuration for the Gap supply-chain outreach page.
 *
 * Everything account-specific lives here: page copy, fictional shipment
 * details, source links, narration and scene timings. To adapt the template
 * for another account, copy this file and change the values; the components
 * read from `outreach` and never hard-code account details.
 *
 * Timings: every time in the walkthrough (scene starts, caption cues and
 * beats) is in seconds from the start of the narration audio, so each value
 * can be checked directly against the audio file. A scene runs from its
 * `start` to the next scene's start (the last one to `walkthrough.duration`).
 * `beats` are the moments when visual changes happen.
 */

import narrationUrl from '../media/gap-narration.mp3';
import openingWebmUrl from '../media/gap-dc-opening.webm';
import openingMp4Url from '../media/gap-dc-opening.mp4';
import openingStillUrl from '../media/gap-dc-final-frame.jpg';
import openingPosterUrl from '../media/gap-dc-first-frame.jpg';

export interface CaptionCue {
  /** Seconds from the start of the narration. */
  at: number;
  text: string;
}

export interface SceneConfig {
  id: string;
  /** Chapter title used in scene navigation. */
  title: string;
  /** Short label for the workflow step rail. */
  stepLabel: string;
  /** Seconds from the start of the narration. */
  start: number;
  /** Full narration for the scene, word for word. */
  narration: string;
  /**
   * Caption cues: short chunks that together spell out `narration` exactly.
   * When omitted, the narration is split into sentences and timed in
   * proportion to word count.
   */
  cues?: CaptionCue[];
  /** Named visual moments, in seconds from the start of the narration. */
  beats: Record<string, number>;
}

export const outreach = {
  account: {
    name: 'Gap',
    /** Text wordmark; shown if the logo is disabled or fails to load. */
    wordmark: 'Gap Inc.',
    /** Official Gap Inc. logo (supplied by the page author), shown in the header. */
    logo: {
      enabled: true,
      src: 'brand/gap-inc-logo.webp',
      /** Read by screen readers in place of the old "Prepared for Gap Inc." text. */
      alt: 'Prepared for Gap Inc.',
    },
    team: 'supply-chain team',
  },

  vendor: {
    wordmark: 'HappyRobot',
    /** Name shown on the agent card and as the sender of agent messages. */
    agentName: 'HappyRobot Agent',
    messageSender: 'HappyRobot',
    /**
     * Official HappyRobot logo mark (real assets only, never redrawn). If
     * disabled or a file fails to load, the agent icon falls back to a
     * neutral dark tile and the header shows the text wordmark alone.
     */
    logoMark: {
      enabled: true,
      /** White mark on a dark tile, used for the agent icon. */
      tileSrc: 'brand/happyrobot-mark-tile.png',
      /** Dark mark, shown beside the wordmark in the page header. */
      markSrc: 'brand/happyrobot-mark.png',
    },
  },

  /**
   * Authorship. Shown in a bar above the header, on the Play screen, in the
   * footer and in the tab title, so the page never reads as an official
   * HappyRobot or Gap page. Set `author` before sharing the page.
   */
  attribution: {
    author: 'Seyon Indran' as string | null,
    context: 'Prepared for a HappyRobot interview',
    disclaimer: 'Not made or endorsed by HappyRobot or Gap',
  },

  page: {
    documentTitle: 'Carrier Delay Walkthrough',
    conceptLabel: 'Illustrative concept',
    eyebrow: 'For Gap’s supply-chain team',
    /** Rendered as one sentence; the second part is set in a lighter tone. */
    headline: { lead: 'How much does a late delivery', follow: 'really cost you?' },
    intro:
      'A short illustration of how HappyRobot could help coordinate delivery changes between carriers and distribution-centre teams.',
    /** Link under the introduction that scrolls to the walkthrough. `{seconds}` is filled from the scene timings. */
    jumpLink: { label: 'See how it could work', meta: '{seconds}-second walkthrough' },
    walkthroughLabel: 'Illustrative workflow · Fictional shipment data · Not a live integration',
    proof: {
      heading: 'Relevant experience at DHL',
      body:
        'HappyRobot agents call carriers to confirm pickup and delivery ETAs and update DHL’s transport management system. They also support warehouse coordination across regions.',
      linkLabel: 'Read the DHL customer story ↗',
      linkUrl: 'https://www.happyrobot.ai/customer-story/dhl',
      distinction: 'The Gap workflow above is a proposed application of related capabilities.',
      /** Compact wording for the in-walkthrough proof card. */
      compact: 'Agents call carriers to confirm ETAs, update the transport management system and support warehouse coordination.',
    },
    closing: {
      question: 'Where could taking that follow-up off your team’s hands make the biggest difference?',
      supporting:
        'A useful first conversation would explore what your systems already handle, what still needs a call and where a small pilot could help.',
      /** Booking link; opens in a new tab so the walkthrough stays open. */
      cta: {
        label: 'Discuss your workflow',
        supporting: 'Book a conversation with Seyon Indran',
        url: 'https://calendar.app.google/xzRKV4XDKQYbD2kK7',
      },
    },
    footer:
      'Illustrative concept. All shipment data and interactions are fictional. This is not an existing Gap deployment, an official HappyRobot demo or a live integration.',
  },

  /** Fictional shipment. Used consistently across every scene. */
  shipment: {
    id: 'DEMO-1042',
    carrier: 'Example Carrier',
    location: 'Example distribution centre',
    originalAppointment: '10:00',
    revisedEta: '12:00',
    approvedAppointment: '12:30',
    delayReason: 'Delayed at previous stop',
    /** Fictional local times shown in the walkthrough, in story order. */
    clock: {
      opening: '09:12',
      callCarrier: '09:14',
      requestSlot: '09:16',
      slotApproved: '09:21',
      checkCarrier: '09:22',
      carrierConfirmed: '09:24',
    },
  },

  /**
   * Optional media. Leave `enabled: false` until the file exists in
   * /public/media. Disabled media is never requested. If an enabled file
   * fails to load, the page falls back silently (placeholder visual /
   * internal clock) without retrying.
   */
  media: {
    /**
     * Opening footage (5.04 s, muted). Plays once from Play, then holds its
     * final frame behind the workflow scenes. Re-encoded from the supplied
     * 10-bit HEVC master so every browser can play it: WebM (VP9) first, H.264
     * MP4 for Safari, with a keyframe every half-second so seeking lands
     * cleanly. `poster` is the first frame (shown on the Play screen, so Play
     * starts without a cut); `still` is the final frame, shown if the video
     * can't load and when the viewer prefers reduced motion.
     */
    openingVideo: {
      enabled: true,
      sources: [
        { src: openingWebmUrl, type: 'video/webm' },
        { src: openingMp4Url, type: 'video/mp4' },
      ],
      poster: openingPosterUrl,
      still: openingStillUrl,
    },
    /**
     * ElevenLabs narration (78.1 s). Imported so the build bundles it; when
     * enabled, its playback time drives the walkthrough.
     */
    narration: {
      enabled: true,
      src: narrationUrl,
    },
  },

  walkthrough: {
    /**
     * Frame shown behind the Play button before playback starts (seconds).
     * 0 keeps the Play screen identical to the first frame of playback, so
     * nothing appears or vanishes when Play is pressed.
     */
    posterTime: 0,
    /**
     * Total runtime. The narration is 78.1 s; the extra seconds hold the
     * closing question on screen so it can be read.
     */
    duration: 82,
    /**
     * Cue and beat times were set by forced alignment of the script against
     * the audio (pocketsphinx), each placed at or just before the spoken
     * phrase noted alongside. They still want a listening check.
     */
    scenes: [
      {
        id: 'delay',
        title: 'The missed appointment',
        stepLabel: 'Delay flagged',
        start: 0,
        narration:
          'A truck carrying stock to a Gap distribution centre is going to miss its unloading appointment. Someone needs to confirm when it will arrive, agree a new slot, and keep the receiving team informed.',
        cues: [
          { at: 0, text: 'A truck carrying stock to a Gap distribution centre' },
          { at: 3.0, text: 'is going to miss its unloading appointment.' },
          { at: 5.7, text: 'Someone needs to confirm when it will arrive,' },
          { at: 8.2, text: 'agree a new slot, and keep the receiving team informed.' },
        ],
        beats: {
          notification: 3.6, // "…miss its unloading appointment"
        },
      },
      {
        id: 'eta',
        title: 'Confirm the ETA',
        stepLabel: 'Contact carrier',
        start: 11.9,
        narration:
          'A HappyRobot agent could call the carrier, confirm the revised arrival time, and record the reason for the delay. Here, the carrier expects to arrive at noon. The receiving team gets an update without having to chase.',
        cues: [
          { at: 12.1, text: 'A HappyRobot agent could call the carrier,' },
          { at: 14.7, text: 'confirm the revised arrival time,' },
          { at: 16.8, text: 'and record the reason for the delay.' },
          { at: 19.1, text: 'Here, the carrier expects to arrive at noon.' },
          { at: 22.4, text: 'The receiving team gets an update without having to chase.' },
        ],
        beats: {
          agentAsks: 13.5, // "call the carrier"
          carrierReplies: 19.2, // "Here, the carrier expects…"
          etaRecorded: 21.6, // "…at noon"
          teamUpdated: 22.6, // "The receiving team gets an update"
        },
      },
      {
        id: 'slot',
        title: 'Request approval',
        stepLabel: 'Coordinate new slot',
        start: 25.8,
        narration:
          'The agent could then request a new unloading slot. In this example, the receiving team approves twelve-thirty. The agent checks with the carrier that the new appointment works.',
        cues: [
          { at: 26.0, text: 'The agent could then request a new unloading slot.' },
          { at: 29.3, text: 'In this example, the receiving team approves twelve-thirty.' },
          { at: 33.1, text: 'The agent checks with the carrier that the new appointment works.' },
        ],
        beats: {
          requestSent: 27.0, // "request a new unloading slot"
          approved: 31.35, // "approves twelve-thirty"
          carrierCheck: 33.75, // "checks with the carrier"
        },
      },
      {
        id: 'confirm',
        title: 'Confirm and update',
        stepLabel: 'Confirm & update',
        start: 36.5,
        narration:
          'Once the carrier confirms, the agent updates the appointment and notifies the receiving team. If a suitable slot can’t be agreed, it passes the case to a person with the details already gathered. That means less time chasing carriers and passing updates between teams. People keep control of the decisions, while the agent handles the follow-through.',
        cues: [
          { at: 36.7, text: 'Once the carrier confirms,' },
          { at: 38.4, text: 'the agent updates the appointment and notifies the receiving team.' },
          { at: 42.4, text: 'If a suitable slot can’t be agreed,' },
          { at: 44.7, text: 'it passes the case to a person with the details already gathered.' },
          { at: 48.5, text: 'That means less time chasing carriers and passing updates between teams.' },
          { at: 53.1, text: 'People keep control of the decisions,' },
          { at: 55.4, text: 'while the agent handles the follow-through.' },
        ],
        beats: {
          carrierConfirms: 37.5, // "Once the carrier confirms"
          recordUpdated: 39.1, // "updates the appointment"
          teamNotified: 40.5, // "notifies the receiving team"
          rule: 42.6, // "If a suitable slot can't be agreed"
          summaryChasing: 49.15, // "less time chasing"
          summaryUpdates: 51.45, // "passing updates"
          summaryControl: 53.6, // "People keep control"
        },
      },
      {
        id: 'resolve',
        title: 'Where this could help',
        stepLabel: 'Resolved',
        start: 57.8,
        narration:
          'At DHL, HappyRobot already confirms carrier arrival times, updates transport systems, and supports warehouse coordination. For Gap, we’d start with one workflow, prove its value, then explore other sites and related tasks. Where could taking that follow-up off your team’s hands make the biggest difference?',
        cues: [
          { at: 58.0, text: 'At DHL, HappyRobot already confirms carrier arrival times,' },
          { at: 62.6, text: 'updates transport systems, and supports warehouse coordination.' },
          { at: 66.7, text: 'For Gap, we’d start with one workflow, prove its value,' },
          { at: 70.55, text: 'then explore other sites and related tasks.' },
          { at: 73.7, text: 'Where could taking that follow-up off your team’s hands make the biggest difference?' },
        ],
        beats: {
          resolved: 57.9, // scene opens as "At DHL…" begins
          proof: 59.2, // "HappyRobot already confirms"
          approachStart: 67.9, // "start with one workflow"
          approachProve: 69.5, // "prove its value"
          approachExplore: 70.9, // "explore other sites"
          question: 73.8, // "Where could taking that follow-up…"
        },
      },
    ] as SceneConfig[],
  },

  /** Proposed-approach line revealed during the expansion narration. */
  approach: {
    label: 'Proposed approach',
    steps: ['Start with one workflow', 'Prove value', 'Explore more sites and tasks'],
  },

  /** Summary revealed during the benefit narration, one phrase at a time. */
  benefitSummary: ['Less chasing.', 'Clear updates.', 'People stay in control.'],
};

export type OutreachConfig = typeof outreach;
