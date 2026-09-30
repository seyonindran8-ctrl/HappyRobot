import { useEffect, useState } from 'react';
import { outreach } from './config/gapOutreach';
import { Walkthrough } from './walkthrough/Walkthrough';
import { buildTimeline } from './walkthrough/timeline';

const { page, account, vendor, attribution } = outreach;
const byline = attribution.author ? `Unofficial concept by ${attribution.author}` : 'Unofficial concept';
const base = import.meta.env.BASE_URL;
const walkthroughSeconds = Math.round(buildTimeline(outreach.walkthrough.scenes, outreach.walkthrough.duration).duration);

/**
 * Scrolls so the player sits clearly in view, then moves focus to it for
 * keyboard users. Never starts playback. Smooth unless the viewer prefers
 * reduced motion.
 */
function scrollToWalkthrough(event: React.MouseEvent<HTMLAnchorElement>) {
  const player = document.getElementById('walkthrough-player');
  if (!player) return;
  event.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = player.getBoundingClientRect();
  // Centre the player when it fits; otherwise put its top just below the edge.
  const offset = Math.max(16, (window.innerHeight - rect.height) / 2);
  window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: reduce ? 'auto' : 'smooth' });
  player.focus({ preventScroll: true });
}

function VendorMark() {
  const [failed, setFailed] = useState(false);
  if (!vendor.logoMark.enabled || failed) return null;
  return <img className="wordmark-mark" src={base + vendor.logoMark.markSrc} alt="" onError={() => setFailed(true)} />;
}

export function App() {
  useEffect(() => {
    document.title = `${page.documentTitle} · ${byline}`;
  }, []);

  return (
    <>
      <div className="attribution-bar">
        <p className="wrap-wide">
          <strong>{byline}</strong>
          <span className="attribution-sep" aria-hidden="true">·</span>
          <span>{attribution.context}</span>
          <span className="attribution-sep" aria-hidden="true">·</span>
          <span>{attribution.disclaimer}</span>
        </p>
      </div>
      <header className="site-header">
        <div className="site-header-rule" aria-hidden="true" />
        <div className="wrap site-header-inner">
          <div className="wordmarks">
            <span className="wordmark">
              <VendorMark />
              {vendor.wordmark}
            </span>
            <span className="wordmark-sep" aria-hidden="true" />
            <span className="wordmark wordmark-account">Prepared for {account.wordmark}</span>
          </div>
          <span className="concept-pill">{page.conceptLabel}</span>
        </div>
      </header>

      <main>
        <section className="hero wrap">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="headline">
            {page.headline.lead} <span className="headline-follow">{page.headline.follow}</span>
          </h1>
          <p className="intro">{page.intro}</p>
          <a className="hero-jump" href="#walkthrough-player" onClick={scrollToWalkthrough}>
            <span className="hero-jump-label">
              {page.jumpLink.label} <span className="hero-jump-arrow" aria-hidden="true">↓</span>
            </span>
            <span className="hero-jump-meta">{page.jumpLink.meta.replace('{seconds}', String(walkthroughSeconds))}</span>
          </a>
        </section>

        <section className="walkthrough wrap-wide" aria-label="Walkthrough">
          <Walkthrough />
        </section>

        <section className="proof wrap">
          <div className="proof-grid">
            <h2 className="section-heading">{page.proof.heading}</h2>
            <div>
              <p className="proof-body">{page.proof.body}</p>
              <a className="proof-link" href={page.proof.linkUrl} target="_blank" rel="noopener noreferrer">
                {page.proof.linkLabel}
              </a>
              <p className="proof-distinction">{page.proof.distinction}</p>
            </div>
          </div>
        </section>

        <section className="closing wrap">
          <div className="closing-inner">
            <h2 className="closing-question">{page.closing.question}</h2>
            <p className="closing-supporting">{page.closing.supporting}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer wrap">
        <p>{page.footer}</p>
        <p>
          {byline}. {attribution.context}. {attribution.disclaimer}. HappyRobot and Gap names and marks belong to
          their respective owners.
        </p>
      </footer>
    </>
  );
}
