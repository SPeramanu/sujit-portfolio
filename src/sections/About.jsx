import Section from '../components/Section.jsx';
import { profile } from '../data/profile.js';

export default function About() {
  return (
    <Section id="about" index="01" title="ABOUT ME">
      <div className="about-layout">
        <div className="about-prose">
          {profile.about.map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <div className="skill-groups">
            {profile.skills.map((g) => (
              <div key={g.group} className="skill-group">
                <span className="skill-group-label">{g.group}</span>
                <div className="tag-row">
                  {g.items.map((s) => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="about-panel hud-frame">
          <div className="panel-title">PROFILE</div>
          {/* Drop a portrait at /public/assets/photos/portrait.jpg and swap
              this placeholder div for:
              <img src="assets/photos/portrait.jpg" alt="Sujit Peramanu" /> */}
          <img src="assets/photos/portrait.jpg" alt="Sujit Peramanu" />
          <dl className="stat-list">
            {profile.stats.map((s) => (
              <div key={s.label} className="stat-row">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </Section>
  );
}
