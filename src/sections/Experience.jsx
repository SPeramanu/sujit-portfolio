import Section from '../components/Section.jsx';
import useReveal from '../hooks/useReveal.js';
import { experience } from '../data/experience.js';

function TimelineEntry({ entry, idx }) {
  const ref = useReveal(0.15);
  return (
    <li className="timeline-entry reveal" ref={ref}>
      <div className="timeline-node" aria-hidden="true">
        <span className="node-ring" />
      </div>
      <article className="timeline-card hud-frame">
        <div className="timeline-card-head">
          <span className="entry-index">{String(idx + 1).padStart(2, '0')}</span>
          <span className="entry-dates">{entry.dates}</span>
        </div>
        <h3>{entry.role}</h3>
        <div className="entry-company">
          {entry.company} <span className="entry-loc">· {entry.location}</span>
        </div>
        <ul className="entry-bullets">
          {entry.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <div className="tag-row">
          {entry.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </article>
    </li>
  );
}

export default function Experience() {
  return (
    <Section id="experience" index="02" title="Experience">
      <ol className="timeline">
        {experience.map((e, i) => (
          <TimelineEntry key={e.company + e.dates} entry={e} idx={i} />
        ))}
      </ol>
    </Section>
  );
}
