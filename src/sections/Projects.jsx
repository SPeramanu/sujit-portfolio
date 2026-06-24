import Section from '../components/Section.jsx';
import { projects } from '../data/projects.js';

export default function Projects() {
  return (
    <Section id="projects" index="03" title="Selected Work">
      <div className="project-grid">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`#/project/${p.id}`}
            className="project-card hud-frame"
          >
            <div className="project-thumb">
              <img src={p.thumb} alt={p.title} loading="lazy" />
              <span className="project-open-hint">View →</span>
            </div>
            <div className="project-card-body">
              <h3>{p.title}</h3>
              <p>{p.subtitle}</p>
              <div className="tag-row">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
                {p.tags.length > 3 && (
                  <span className="tag tag-more">+{p.tags.length - 3}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
