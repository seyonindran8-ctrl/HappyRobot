import { useState, type ReactNode } from 'react';
import { outreach } from '../config/gapOutreach';
import { beatTime, sceneAt, type Timeline } from './timeline';
import { Backdrop } from './Backdrop';

const { shipment, page, vendor, approach, benefitSummary } = outreach;
const base = import.meta.env.BASE_URL;
const { clock } = shipment;

interface Props {
  timeline: Timeline;
  time: number;
  /** Real playback time for the footage (0 on the Play screen, so Play starts without a jump). */
  backdropTime: number;
  playing: boolean;
  reducedMotion: boolean;
}

/**
 * Every visual state below is a pure function of `time`, so seeking and
 * pausing never leave the stage out of step with the captions.
 *
 * Layout: a photographic backdrop, a stack of workflow cards on the right
 * (trigger → agent → current actions), the shipment record bottom-left, and a
 * resolution panel that covers the stage in the final scene.
 */
export function Stage({ timeline, time, backdropTime, playing, reducedMotion }: Props) {
  const scene = sceneAt(timeline, time);
  const reached = (sceneId: string, beat: string) => time >= beatTime(timeline, sceneId, beat);
  /** True for a short window after a beat, used to highlight changed values. */
  const fresh = (sceneId: string, beat: string) => {
    const b = beatTime(timeline, sceneId, beat);
    return time >= b && time < b + 2.2;
  };

  const inOpening = scene.id === 'delay';
  const resolving = scene.id === 'resolve';

  const etaConfirmed = reached('eta', 'etaRecorded');
  const slotApproved = reached('slot', 'approved');
  const carrierConfirmed = reached('confirm', 'carrierConfirms');
  const appointmentUpdated = reached('confirm', 'recordUpdated');
  const teamUpdated = reached('eta', 'teamUpdated');
  const teamNotified = reached('confirm', 'teamNotified');
  const summaryBeats = ['summaryChasing', 'summaryUpdates', 'summaryControl'];
  const approachBeats = ['approachStart', 'approachProve', 'approachExplore'];

  let status = 'Arrival delayed';
  if (etaConfirmed) status = 'ETA confirmed';
  if (reached('slot', 'requestSent')) status = 'New slot requested';
  if (slotApproved) status = 'Slot approved · awaiting carrier';
  if (carrierConfirmed) status = 'Carrier confirmed';
  if (appointmentUpdated) status = 'Appointment confirmed';

  return (
    <div className={`stage scene-${scene.id}`}>
      <Backdrop
        time={backdropTime}
        openingEnd={timeline.scenes[1]?.start ?? timeline.duration}
        duration={timeline.duration}
        playing={playing}
        reducedMotion={reducedMotion}
      />
      <div className={`backdrop-shade ${inOpening ? '' : 'is-deep'}`} aria-hidden="true" />

      <div className="stage-place" aria-hidden={!inOpening}>
        <span>{shipment.location}</span>
        <span className="stage-place-clock">{clock.opening}</span>
      </div>

      <div className="stage-grid">
        <div className="stack">
          <Reveal show={reached('delay', 'notification')}>
            <Card className="trigger-card">
              <CardLine icon={<Icon kind="alert" />} label="Arrival delayed" detail={shipment.id} />
              <p className="card-sub">
                {shipment.carrier} · Unloading appointment {shipment.originalAppointment} likely to be missed
              </p>
            </Card>
          </Reveal>

          {!inOpening && !resolving && (
            <>
              <Connector />
              <div className="frame" key={scene.id}>
                <Card>
                  <CardLine icon={<AgentMark />} label={vendor.agentName} detail="Carrier coordination" />
                  <div className="agent-progress">
                    <span className="agent-progress-bars" aria-hidden="true">
                      {timeline.scenes.map((s) => (
                        <span key={s.id} className={s.index <= scene.index ? 'is-on' : ''} />
                      ))}
                    </span>
                    <span>
                      Stage {scene.index + 1} of {timeline.scenes.length} · <strong>{scene.stepLabel}</strong>
                    </span>
                  </div>
                </Card>

                {scene.id === 'eta' && (
                  <>
                    <Reveal show={reached('eta', 'agentAsks')}>
                      <Card>
                        <CardLine icon={<Icon kind="call" />} label="Call carrier" detail={shipment.carrier} />
                        <Chips>
                          <Chip state={etaConfirmed ? 'done' : 'active'}>Confirm ETA</Chip>
                          <Chip state={etaConfirmed ? 'done' : 'idle'}>Record delay reason</Chip>
                          <Chip state="idle" muted>
                            Simulated call
                          </Chip>
                        </Chips>
                      </Card>
                    </Reveal>
                    <Reveal show={reached('eta', 'agentAsks')}>
                      <Card className="chat">
                        <Message who={vendor.messageSender} avatar={<AgentMark />} at={clock.callCarrier}>
                          What’s the revised arrival time for shipment {shipment.id}?
                        </Message>
                        <Reveal show={reached('eta', 'carrierReplies')}>
                          <Message who={shipment.carrier} avatar={<Initials text="EC" />} at={clock.callCarrier}>
                            Around noon. We’ve been delayed at the previous stop.
                          </Message>
                        </Reveal>
                      </Card>
                    </Reveal>
                  </>
                )}

                {scene.id === 'slot' && (
                  <>
                    <Reveal show={reached('slot', 'requestSent')}>
                      <Card>
                        <CardLine icon={<Icon kind="message" />} label="Message receiving team" detail="Request revised slot" />
                        <Chips>
                          <Chip state="done">Share ETA {shipment.revisedEta}</Chip>
                          <Chip state={slotApproved ? 'done' : 'active'}>Request unloading slot</Chip>
                        </Chips>
                      </Card>
                    </Reveal>
                    <Reveal show={slotApproved}>
                      <Card className="chat approval-card">
                        <Message
                          who="Receiving team"
                          avatar={<Initials text="RT" />}
                          at={clock.slotApproved}
                          tag="Human approval"
                        >
                          {shipment.approvedAppointment} unloading slot approved.
                        </Message>
                      </Card>
                    </Reveal>
                    <Reveal show={reached('slot', 'carrierCheck')}>
                      <Card>
                        <CardLine icon={<Icon kind="call" />} label="Call carrier" detail={`Can you meet ${shipment.approvedAppointment}?`} />
                        <Chips>
                          <Chip state="active">Awaiting carrier confirmation</Chip>
                        </Chips>
                      </Card>
                    </Reveal>
                  </>
                )}

                {scene.id === 'confirm' && (
                  <Reveal show={carrierConfirmed}>
                    <Card className="chat">
                      <Message who={shipment.carrier} avatar={<Initials text="EC" />} at={clock.carrierConfirmed}>
                        Confirmed for {shipment.approvedAppointment}.
                      </Message>
                    </Card>
                  </Reveal>
                )}
              </div>

              {scene.id === 'confirm' && (
                <>
                  <Reveal show={carrierConfirmed}>
                    <Connector />
                  </Reveal>
                  <div className="frame frame-results">
                    <Reveal show={carrierConfirmed}>
                      <Card>
                        <CardLine icon={<Icon kind="check" />} label="Carrier confirmed" detail={`Unloading ${shipment.approvedAppointment}`} />
                      </Card>
                    </Reveal>
                    <Reveal show={appointmentUpdated}>
                      <Card>
                        <CardLine
                          icon={<Icon kind="sync" />}
                          label="Delivery record updated"
                          detail="Appointment"
                          badge={shipment.approvedAppointment}
                        />
                      </Card>
                    </Reveal>
                    <Reveal show={teamNotified}>
                      <Card>
                        <CardLine icon={<Icon kind="message" />} label="Receiving team notified" detail="Agreed plan shared" />
                      </Card>
                    </Reveal>
                  </div>
                  <Reveal show={reached('confirm', 'rule')}>
                    <p className="rule">
                      <span className="rule-tag">Rule</span>
                      No suitable slot or approval? Escalate with context.
                    </p>
                  </Reveal>
                </>
              )}
            </>
          )}
        </div>

        <div className="stage-left">
        {/* Benefit summary: shown beside the completed workflow while the benefit is narrated. */}
        <div className="summary" aria-hidden={scene.id !== 'confirm' || !reached('confirm', summaryBeats[0])}>
          {benefitSummary.map((line, i) => (
            <Reveal key={line} show={scene.id === 'confirm' && reached('confirm', summaryBeats[i])} className="summary-line">
              {line}
            </Reveal>
          ))}
        </div>

        <Reveal show={!inOpening && !resolving} className="record-wrap">
          <aside className="record" aria-label="Fictional shipment record">
            <div className="record-head">
              <span className="record-kicker">Fictional shipment record</span>
              <span className="record-id mono">{shipment.id}</span>
            </div>
            <dl className="record-rows">
              <Row label="Carrier ETA" highlight={fresh('eta', 'etaRecorded')}>
                {etaConfirmed ? <strong>{shipment.revisedEta}</strong> : <span className="muted">Unconfirmed</span>}
              </Row>
              <Row label="Delay reason" secondary>
                {etaConfirmed ? shipment.delayReason : <span className="muted">—</span>}
              </Row>
              <Row label="Unloading appointment" highlight={fresh('confirm', 'recordUpdated')}>
                {appointmentUpdated ? (
                  <>
                    <s className="muted">{shipment.originalAppointment}</s> <strong>{shipment.approvedAppointment}</strong>
                  </>
                ) : (
                  <>
                    <strong>{shipment.originalAppointment}</strong>{' '}
                    {slotApproved ? (
                      <span className="chip-inline">{shipment.approvedAppointment} approved · awaiting carrier</span>
                    ) : (
                      <span className="chip-inline is-warn">At risk</span>
                    )}
                  </>
                )}
              </Row>
              <Row label="Receiving team" highlight={fresh('eta', 'teamUpdated') || fresh('confirm', 'teamNotified')}>
                {teamNotified ? 'Notified of agreed plan' : teamUpdated ? `Informed of ETA ${shipment.revisedEta}` : <span className="muted">Not yet informed</span>}
              </Row>
            </dl>
            <div className={`record-status ${appointmentUpdated ? 'is-resolved' : ''}`}>
              <span className="record-status-dot" aria-hidden="true" />
              {status}
            </div>
          </aside>
        </Reveal>
        </div>
      </div>

      <div className={`resolve ${resolving ? 'is-visible' : ''}`} aria-hidden={!resolving}>
        <div className="resolve-inner">
          <Reveal show={resolving && reached('resolve', 'resolved')} className="resolve-main">
            <p className="resolve-kicker">
              <Icon kind="check" /> <span className="mono">{shipment.id}</span> · {shipment.carrier}
            </p>
            <p className="resolve-title">
              Appointment confirmed: <span className="resolve-title-time">{shipment.approvedAppointment}</span>
            </p>
            <dl className="resolve-facts">
              <div>
                <dt>Carrier ETA</dt>
                <dd>{shipment.revisedEta}</dd>
              </div>
              <div>
                <dt>Unloading appointment</dt>
                <dd>{shipment.approvedAppointment}</dd>
              </div>
              <div>
                <dt>Receiving team</dt>
                <dd>Informed</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal show={resolving && reached('resolve', 'proof')} className="resolve-proof">
            <div className="proof-card">
              <span className="proof-card-tag">In use at DHL</span>
              <p>{page.proof.compact}</p>
            </div>
          </Reveal>
          <Reveal show={resolving && reached('resolve', approachBeats[0])} className="resolve-approach">
            <span className="resolve-approach-label">{approach.label}</span>
            <p className="resolve-approach-steps">
              {approach.steps.map((step, i) => (
                <span key={step} className={`resolve-approach-step ${resolving && reached('resolve', approachBeats[i]) ? 'is-in' : ''}`}>
                  {i > 0 && (
                    <span className="resolve-approach-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                  {step}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal show={resolving && reached('resolve', 'question')} className="resolve-question-wrap">
            <p className="resolve-question">{page.closing.question}</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function Reveal({ show, children, className = '' }: { show: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`reveal ${show ? 'is-in' : ''} ${className}`} aria-hidden={!show}>
      {children}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CardLine({ icon, label, detail, badge }: { icon: ReactNode; label: string; detail?: string; badge?: string }) {
  return (
    <div className="card-line">
      {icon}
      <span className="card-label">{label}</span>
      {detail && (
        <>
          <span className="card-dot" aria-hidden="true">
            ·
          </span>
          <span className="card-detail">{detail}</span>
        </>
      )}
      {badge && <span className="card-badge mono">{badge}</span>}
    </div>
  );
}

function Chips({ children }: { children: ReactNode }) {
  return <div className="chips">{children}</div>;
}

function Chip({ state, muted, children }: { state: 'done' | 'active' | 'idle'; muted?: boolean; children: ReactNode }) {
  return (
    <span className={`chip is-${state} ${muted ? 'is-muted' : ''}`}>
      <span className="chip-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

function Message({ who, avatar, at, tag, children }: { who: string; avatar: ReactNode; at: string; tag?: string; children: ReactNode }) {
  return (
    <div className="message">
      <span className="message-avatar">{avatar}</span>
      <div>
        <p className="message-head">
          <strong>{who}</strong> <span className="message-time">{at}</span>
          {tag && <span className="message-tag">{tag}</span>}
        </p>
        <p className="message-text">{children}</p>
      </div>
    </div>
  );
}

function Initials({ text }: { text: string }) {
  return <span className="initials">{text}</span>;
}

function Connector() {
  return (
    <div className="connector" aria-hidden="true">
      <span>
        <svg viewBox="0 0 16 16" width="12" height="12">
          <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function Row({ label, highlight, secondary, children }: { label: string; highlight?: boolean; secondary?: boolean; children: ReactNode }) {
  return (
    <div className={`record-row ${highlight ? 'is-fresh' : ''} ${secondary ? 'is-secondary' : ''}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** The vendor's official logo mark when supplied; otherwise a neutral tile. */
function AgentMark() {
  const [failed, setFailed] = useState(false);
  if (!vendor.logoMark.enabled || failed) return <Icon kind="agent" />;
  return (
    <span className="icon icon-logo">
      <img src={base + vendor.logoMark.tileSrc} alt="" onError={() => setFailed(true)} />
    </span>
  );
}

type IconKind = 'alert' | 'agent' | 'call' | 'message' | 'sync' | 'check';

/** Generic tile icons in the style of a workflow canvas; not product logos. */
function Icon({ kind }: { kind: IconKind }) {
  const paths: Record<IconKind, ReactNode> = {
    alert: <path d="M8 4.5v4.2M8 11.2v.3" strokeWidth="1.8" />,
    agent: (
      <>
        <circle cx="8" cy="8" r="3.6" />
        <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
    call: <path d="M5.2 3.8l1.6.2.8 2.2-1.1.9a6.4 6.4 0 0 0 2.4 2.4l.9-1.1 2.2.8.2 1.6c-.2.7-.8 1.2-1.5 1.2A7.9 7.9 0 0 1 4 4.9c0-.7.5-1.1 1.2-1.1z" />,
    message: (
      <>
        <rect x="3.5" y="4.5" width="9" height="7" rx="1.5" />
        <path d="M4 5.5l4 3 4-3" />
      </>
    ),
    sync: (
      <>
        <path d="M11.8 6.6A4 4 0 0 0 4.6 6M4.2 9.4a4 4 0 0 0 7.2.6" />
        <path d="M4.4 3.8v2.4h2.4M11.6 12.2V9.8H9.2" />
      </>
    ),
    check: <path d="M4.5 8.3l2.3 2.3 4.7-5" strokeWidth="1.8" />,
  };
  return (
    <span className={`icon icon-${kind}`}>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {paths[kind]}
      </svg>
    </span>
  );
}
