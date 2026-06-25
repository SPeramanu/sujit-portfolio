import { Fragment, useEffect, useState } from 'react';
import { projects } from '../data/projects.js';

// Reads the current "#/project/<id>" hash and returns the matching project id.
function parseId() {
  const m = window.location.hash.match(/^#\/project\/([\w-]+)/);
  return m ? m[1] : null;
}

function renderDescription(desc) {
  const out = [];
  let listBuf = [];
  const flushList = () => {
    if (!listBuf.length) return;
    out.push(<ul key={`ul-${out.length}`}>{listBuf}</ul>);
    listBuf = [];
  };
  desc.forEach((s, i) => {
    if (s.startsWith('## ')) {
      flushList();
      out.push(<h3 key={i}>{s.slice(3)}</h3>);
    } else if (s.startsWith('- ')) {
      listBuf.push(<li key={i}>{s.slice(2)}</li>);
    } else {
      flushList();
      out.push(<p key={i}>{s}</p>);
    }
  });
  flushList();
  return out;
}

export default function ProjectPage() {
  const [id, setId] = useState(parseId);
  const [activeImg, setActiveImg] = useState(0);

  // keep in sync when navigating between projects (prev / next links)
  useEffect(() => {
    const onHash = () => {
      setId(parseId());
      setActiveImg(0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // always start a project page from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const index = projects.findIndex((p) => p.id === id);
  const project = projects[index] || null;

  if (!project) {
    return (
      <div className="project-page">
        <header className="project-page-header">
          <a href="#projects" className="btn btn-ghost project-back">
            ← Back to work
          </a>
        </header>
        <div className="project-page-body">
          <p className="project-missing">That project doesn’t exist.</p>
        </div>
      </div>
    );
  }

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const hasGallery = project.images && project.images.length > 0;
  const rich = project.rich;

  const media = (
    <div className="project-media">
      {project.youtube && (
        <iframe
          src={`https://www.youtube.com/embed/${project.youtube}`}
          title={project.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {!project.youtube && project.video && (
        <video src={project.video} controls playsInline />
      )}
      {hasGallery && (
        <>
          <img
            src={project.images[activeImg]}
            alt={`${project.title} — view ${activeImg + 1}`}
            className="project-main-img"
          />
          {project.images.length > 1 && (
            <div className="modal-thumbs">
              {project.images.map((src, i) => (
                <button
                  key={src}
                  className={i === activeImg ? 'active' : ''}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="project-page">
      <header className="project-page-header">
        <a href="#projects" className="btn btn-ghost project-back">
          ← Back to work
        </a>
      </header>

      <article className="project-page-body">
        <div className="project-hero">
          <p className="project-eyebrow">
            {rich && rich.eyebrow ? rich.eyebrow : `${project.role} · ${project.period}`}
          </p>
          <h1>{project.title}</h1>
          <p className="project-lede">{rich ? rich.lede : project.subtitle}</p>
          <div className="tag-row project-hero-tags">
            {project.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        {rich ? (
          <>
            {rich.pipeline && (
              <section className="cv-pipeline">
                {rich.pipelineLabel && (
                  <div className="cv-section-label">{rich.pipelineLabel}</div>
                )}
                <div className="cv-pipeline-flow">
                  {rich.pipeline.map((stage, i) => (
                    <Fragment key={stage.k}>
                      <div className="cv-stage">
                        <div className="cv-stage-k">{stage.k}</div>
                        <div className="cv-stage-t">{stage.t}</div>
                        <div className="cv-stage-s">{stage.s}</div>
                      </div>
                      {i < rich.pipeline.length - 1 && (
                        <span className="cv-stage-arrow" aria-hidden="true">→</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              </section>
            )}

            {rich.stats && (
              <section className="cv-stats">
                {rich.stats.map((s) => (
                  <div className="cv-stat" key={s.l}>
                    <div className="cv-stat-v">{s.v}</div>
                    <div className="cv-stat-l">{s.l}</div>
                  </div>
                ))}
              </section>
            )}

            {(hasGallery || project.video || project.youtube) && media}

            {(rich.sections || []).map((sec) => (
              <section className="cv-body" key={sec.title}>
                <h2 className="cv-section-heading">{sec.title}</h2>
                {renderDescription(sec.body)}
              </section>
            ))}

            {rich.cards && (
              <section className="cv-cards-block">
                {rich.cardsTitle && (
                  <h2 className="cv-section-heading">{rich.cardsTitle}</h2>
                )}
                <div className="cv-cards">
                  {rich.cards.map((c) => (
                    <div className="cv-card" key={c.title}>
                      <div className="cv-card-head">
                        <span className="cv-card-icon" aria-hidden="true">{c.icon}</span>
                        <h3>{c.title}</h3>
                      </div>
                      <p>{c.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(rich.outro || []).map((sec) => (
              <section className="cv-body" key={sec.title}>
                <h2 className="cv-section-heading">{sec.title}</h2>
                {renderDescription(sec.body)}
              </section>
            ))}

            {project.reportUrl && (
              <div className="project-links">
                <a href={project.reportUrl} target="_blank" rel="noreferrer" className="project-link">
                  <span className="project-link-icon" aria-hidden="true">&#x25B6;</span>
                  {project.reportLabel || 'Read the full report (PDF)'}
                </a>
              </div>
            )}
          </>
        ) : (
          <>
            {media}
            <div className="project-prose">
              {renderDescription(project.description)}
            </div>
          </>
        )}

        <nav className="project-pager">
          <a href={`#/project/${prev.id}`} className="project-pager-link">
            <span className="project-pager-dir">← Previous</span>
            <span className="project-pager-title">{prev.title}</span>
          </a>
          <a href={`#/project/${next.id}`} className="project-pager-link project-pager-next">
            <span className="project-pager-dir">Next →</span>
            <span className="project-pager-title">{next.title}</span>
          </a>
        </nav>
      </article>
    </div>
  );
}
