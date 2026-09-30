import { outreach } from './config/gapOutreach';
import { Walkthrough } from './walkthrough/Walkthrough';

const { page, account, vendor, preparedBy } = outreach;

export function App() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-rule" aria-hidden="true" />
        <div className="wrap site-header-inner">
          <div className="wordmarks">
            <span className="wordmark">{vendor.wordmark}</span>
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
        {preparedBy && <p>Prepared by {preparedBy}.</p>}
      </footer>
    </>
  );
}
