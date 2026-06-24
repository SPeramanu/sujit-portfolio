import { useEffect, useState } from 'react';
import { projects } from '../data/projects.js';

// Reads the current "#/project/<id>" hash and returns the matching project id.
function parseId() {
  const m = window.location.hash.match(/^#\/project\/([\w-]+)/);
  return m ? m[1] : null;
}

// Dedicated detail page for a single project: media (YouTube > video > image
// gallery) + write-up. Reached from the Selected Work cards on the main page.
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
            {project.role} · {project.period}
          </p>
          <h1>{project.title}</h1>
          <p className="project-lede">{project.subtitle}</p>
          <div className="tag-row project-hero-tags">
            {project.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="project-media">
          {project.youtube ? (
            <iframe
              src={`https://www.youtube.com/embed/${project.youtube}`}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : project.video ? (
            <video src={project.video} controls playsInline />
          ) : hasGallery ? (
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
          ) : null}
        </div>

        <div className="project-prose">
          {project.description.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

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
