/**
 * Account configuration for the Gap supply-chain outreach page.
 *
 * Everything account-specific lives here: page copy, fictional shipment
 * details, source links, narration and scene timings. To adapt the template
 * for another account, copy this file and change the values; the components
 * read from `outreach` and never hard-code account details.
 *
 * Timings: each scene has a `duration` (seconds). Scene start times are
 * derived by summing durations, so lengthening one scene shifts everything
 * after it. `beats` are offsets in seconds from the start of their scene and
 * control when each visual change happens. After the narration is generated,
 * adjust durations (and, if needed, beats and caption cues) to match it.
 */

export interface CaptionCue {
  /** Seconds from the start of the scene. */
  at: number;
  text: string;
}

export interface SceneConfig {
  id: string;
  /** Chapter title used in scene navigation. */
  title: string;
  /** Short label for the workflow step rail. */
  stepLabel: string;
  duration: number;
  /** Full narration for the scene; also shown as captions. */
  narration: string;
  /**
   * Optional hand-timed caption cues. When omitted, the narration is split
   * into sentences and timed in proportion to word count.
   */
  cues?: CaptionCue[];
  /** Named moments within the scene, in seconds from scene start. */
  beats: Record<string, number>;
}

export const outreach = {
  account: {
    name: 'Gap',
    /** Understated text wordmark; no logo assets are used. */
    wordmark: 'Gap Inc.',
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
    headline: { lead: 'When a carrier runs late,', follow: 'how much work follows?' },
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
      question: 'Where does carrier coordination still require the most manual follow-up?',
      supporting:
        'A useful first conversation would explore what your systems already handle, what still needs a call and where a small pilot could help.',
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
    openingVideo: {
      enabled: false,
      src: 'media/gap-dc-opening.mp4',
    },
    narration: {
      enabled: false,
      src: 'media/gap-narration.mp3',
    },
  },

  walkthrough: {
    /** Frame shown behind the Play button before playback starts (seconds). */
    posterTime: 4,
    scenes: [
      {
        id: 'delay',
        title: 'The missed appointment',
        stepLabel: 'Delay flagged',
        duration: 12,
        narration:
          'A truck carrying stock to a Gap distribution centre will miss its unloading appointment. Someone needs to confirm when it will arrive, agree a new slot and keep the receiving team informed.',
        beats: { notification: 1.8 },
      },
      {
        id: 'eta',
        title: 'Confirm the ETA',
        stepLabel: 'Contact carrier',
        duration: 15,
        narration:
          'An agent could contact the carrier, confirm the revised arrival time and record the reason for the delay. The receiving team gets the information without having to chase it.',
        beats: { agentAsks: 1.2, carrierReplies: 4.6, etaRecorded: 8.2 },
      },
      {
        id: 'slot',
        title: 'Request approval',
        stepLabel: 'Coordinate new slot',
        duration: 17,
        narration:
          'It could request a revised unloading slot from the receiving team. In this example, a person approves twelve-thirty. The agent then checks that the carrier can meet the new appointment.',
        beats: { requestSent: 1.2, approved: 6.2, carrierCheck: 11 },
      },
      {
        id: 'confirm',
        title: 'Confirm and update',
        stepLabel: 'Confirm & update',
        duration: 15,
        narration:
          'Once confirmed, the agent updates the appointment and shares the agreed plan. If there’s no suitable slot, or approval is needed, it hands the case to a person with the context attached.',
        beats: { carrierConfirms: 0.8, recordUpdated: 3.4, teamNotified: 5.6, rule: 8.6 },
      },
      {
        id: 'resolve',
        title: 'Where this could help',
        stepLabel: 'Resolved',
        duration: 16,
        narration:
          'At DHL, HappyRobot already confirms carrier ETAs and supports warehouse coordination. For Gap, we’d explore where similar capabilities could reduce manual follow-up. Which delivery changes take your team the most calls to resolve?',
        beats: { resolved: 0.4, proof: 4.6, question: 10 },
      },
    ] as SceneConfig[],
  },
};

export type OutreachConfig = typeof outreach;
