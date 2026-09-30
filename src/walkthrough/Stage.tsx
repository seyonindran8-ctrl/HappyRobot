import type { ReactNode } from 'react';
import { outreach } from '../config/gapOutreach';
import { beatTime, sceneAt, type Timeline } from './timeline';
import { OpeningScene } from './OpeningScene';

const { shipment, page } = outreach;

interface Props {
  timeline: Timeline;
  time: number;
  playing: boolean;
  reducedMotion: boolean;
}

/**
 * Every visual state below is a pure function of `time`, so seeking and
 * pausing never leave the stage out of step with the captions.
 */
export function Stage({ timeline, time, playing, reducedMotion }: Props) {
  const scene = sceneAt(timeline, time);
  const reached = (sceneId: string, beat: string) => time >= beatTime(timeline, sceneId, beat);
  /** True for a short window after a beat, used to highlight changed values. */
  const fresh = (sceneId: string, beat: string) => {
    const b = beatTime(timeline, sceneId, beat);
    return time >= b && time < b + 2.2;
  };

  const opening = timeline.scenes[0];
  const inOpening = scene.id === opening.id;

  // Derived shipment record state.
  const etaConfirmed = reached('eta', 'etaRecorded');
  const slotApproved = reached('slot', 'approved');
  const appointmentUpdated = reached('confirm', 'recordUpdated');
  const teamNotified = reached('confirm', 'teamNotified');

  let status = 'Arrival delayed';
  if (etaConfirmed) status = 'ETA confirmed';
  if (reached('slot', 'requestSent')) status = 'New slot requested';
  if (slotApproved) status = 'Slot approved · awaiting carrier';
  if (reached('confirm', 'carrierConfirms')) status = 'Carrier confirmed';
  if (appointmentUpdated) status = 'Appointment confirmed';

  return (
    <div className="stage" data-scene={scene.id}>
      <div className={`stage-layer stage-opening ${inOpening ? 'is-visible' : ''}`} aria-hidden={!inOpening}>
        <OpeningScene
          local={Math.min(time - opening.start, opening.duration)}
          sceneDuration={opening.duration}
          playing={playing}
          active={inOpening}
          showNotification={reached('delay', 'notification')}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className={`stage-layer stage-workflow ${inOpening ? '' : 'is-visible'}`} aria-hidden={inOpening}>
        <ol className="steps" aria-label="Workflow stages">
          {timeline.scenes.map((s) => {
            const state = s.index < scene.index ? 'done' : s.index === scene.index ? 'active' : 'upcoming';
            return (
              <li key={s.id} className={`step is-${state}`} aria-current={state === 'active' ? 'step' : undefined}>
                <span className="step-marker" aria-hidden="true">
                  {state === 'done' ? <Check /> : s.index + 1}
                </span>
                <span className="step-label">{s.stepLabel}</span>
              </li>
            );
          })}
        </ol>

        <div className="focus">
          {scene.id === 'eta' && (
            <Panel key="eta" kicker="Contact carrier" title={`Voice call · ${shipment.carrier}`} note="Simulated transcript">
              <Reveal show={reached('eta', 'agentAsks')}>
                <Utterance who="Agent" tone="agent">
                  What’s the revised arrival time for shipment <span className="mono">{shipment.id}</span>?
                </Utterance>
              </Reveal>
              <Reveal show={reached('eta', 'carrierReplies')}>
                <Utterance who={shipment.carrier} tone="external">
                  Around noon. We’ve been delayed at the previous stop.
                </Utterance>
              </Reveal>
              <Reveal show={etaConfirmed}>
                <Action done label={`Recorded carrier ETA ${shipment.revisedEta}`} detail={`Reason: ${shipment.delayReason.toLowerCase()}`} />
                <p className="focus-aside">
                  The unloading appointment stays at {shipment.originalAppointment} until a new slot is agreed.
                </p>
              </Reveal>
            </Panel>
          )}

          {scene.id === 'slot' && (
            <Panel key="slot" kicker="Coordinate new slot" title="Receiving team">
              <Reveal show={reached('slot', 'requestSent')}>
                <Utterance who="Agent → Receiving team" tone="agent">
                  <span className="mono">{shipment.id}</span> is now expected around {shipment.revisedEta}. Please confirm a revised unloading slot.
                </Utterance>
              </Reveal>
              <Reveal show={slotApproved}>
                <div className="approval">
                  <span className="approval-tag">Human approval</span>
                  <p>
                    <strong>Receiving team:</strong> {shipment.approvedAppointment} unloading slot approved.
                  </p>
                </div>
              </Reveal>
              <Reveal show={reached('slot', 'carrierCheck')}>
                <Utterance who={`Agent → ${shipment.carrier}`} tone="agent">
                  Can you meet a {shipment.approvedAppointment} unloading appointment?
                </Utterance>
                <Action pending label="Awaiting carrier confirmation" />
              </Reveal>
            </Panel>
          )}

          {scene.id === 'confirm' && (
            <Panel key="confirm" kicker="Confirm & update" title="Close the loop">
              <Reveal show={reached('confirm', 'carrierConfirms')}>
                <Utterance who={shipment.carrier} tone="external">
                  Confirmed for {shipment.approvedAppointment}.
                </Utterance>
              </Reveal>
              <ul className="actions">
                <Reveal as="li" show={reached('confirm', 'carrierConfirms')}>
                  <Action done label="Carrier confirmation received" />
                </Reveal>
                <Reveal as="li" show={appointmentUpdated}>
                  <Action done label={`Delivery record updated · appointment ${shipment.approvedAppointment}`} />
                </Reveal>
                <Reveal as="li" show={teamNotified}>
                  <Action done label="Receiving team notified of the agreed plan" />
                </Reveal>
              </ul>
              <Reveal show={reached('confirm', 'rule')}>
                <div className="rule">
                  <span className="rule-tag">Rule</span>
                  No suitable slot or approval? Escalate with context.
                </div>
              </Reveal>
            </Panel>
          )}

          {scene.id === 'resolve' && (
            <div className="resolve" key="resolve">
              <Reveal show={reached('resolve', 'resolved')}>
                <p className="resolve-kicker">
                  <span className="mono">{shipment.id}</span> · {shipment.carrier}
                </p>
                <p className="resolve-title">Appointment confirmed: {shipment.approvedAppointment}</p>
                <p className="resolve-summary">
                  Carrier ETA {shipment.revisedEta} · Unloading {shipment.approvedAppointment} · Receiving team informed
                </p>
              </Reveal>
              <Reveal show={reached('resolve', 'proof')}>
                <div className="proof-card">
                  <span className="proof-card-tag">Public proof · DHL</span>
                  <p>{page.proof.compact}</p>
                </div>
              </Reveal>
              <Reveal show={reached('resolve', 'question')}>
                <p className="resolve-question">{page.closing.question}</p>
              </Reveal>
            </div>
          )}
        </div>

        <aside className="record" aria-label="Fictional shipment record">
          <div className="record-head">
            <span className="record-kicker">Shipment record</span>
            <span className="record-id mono">{shipment.id}</span>
          </div>
          <dl className="record-rows">
            <Row label="Carrier" secondary>{shipment.carrier}</Row>
            <Row label="Destination" secondary>{shipment.location}</Row>
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
                    <span className="chip">{shipment.approvedAppointment} approved · awaiting carrier</span>
                  ) : (
                    <span className="chip chip-warn">At risk</span>
                  )}
                </>
              )}
            </Row>
            <Row label="Receiving team" highlight={fresh('eta', 'etaRecorded') || fresh('confirm', 'teamNotified')}>
              {teamNotified ? 'Notified of agreed plan' : etaConfirmed ? `Informed of ETA ${shipment.revisedEta}` : <span className="muted">Not yet informed</span>}
            </Row>
          </dl>
          <div className={`record-status ${appointmentUpdated ? 'is-resolved' : ''}`}>
            <span className="record-status-dot" aria-hidden="true" />
            {status}
          </div>
          <p className="record-foot">Fictional data</p>
        </aside>
      </div>
    </div>
  );
}

function Panel({ kicker, title, note, children }: { kicker: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <span className="panel-kicker">{kicker}</span>
        <span className="panel-title">{title}</span>
        {note && <span className="panel-note">{note}</span>}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function Reveal({ show, children, as = 'div' }: { show: boolean; children: ReactNode; as?: 'div' | 'li' }) {
  const Tag = as;
  return (
    <Tag className={`reveal ${show ? 'is-in' : ''}`} aria-hidden={!show}>
      {children}
    </Tag>
  );
}

function Utterance({ who, tone, children }: { who: string; tone: 'agent' | 'external'; children: ReactNode }) {
  return (
    <div className={`utterance is-${tone}`}>
      <span className="utterance-who">{who}</span>
      <p className="utterance-text">“{children}”</p>
    </div>
  );
}

function Action({ label, detail, done, pending }: { label: string; detail?: string; done?: boolean; pending?: boolean }) {
  return (
    <div className={`action ${done ? 'is-done' : ''} ${pending ? 'is-pending' : ''}`}>
      <span className="action-icon" aria-hidden="true">
        {done ? <Check /> : <span className="pending-dot" />}
      </span>
      <span>
        <span className="action-label">{label}</span>
        {detail && <span className="action-detail">{detail}</span>}
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

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
