import { useState } from 'react';
import Section from '../components/Section.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import { projects } from '../data/projects.js';

export default function Projects() {
  const [selected, setSelected] = useState(null);

  return (
    <Section id="projects" index="03" title="PROJECT FILES">
      <div className="project-grid">
        {projects.map((p) => (
          <button
            key={p.id}
            className="project-card hud-frame"
            onClick={() => setSelected(p)}
          >
            <div className="project-thumb">
              <img src={p.thumb} alt={p.title} loading="lazy" />
              <span className="project-open-hint">OPEN FILE ►</span>
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
          </button>
        ))}
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </Section>
  );
}
