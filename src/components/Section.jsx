import useReveal from '../hooks/useReveal.js';

// Standard section shell: numbered HUD header + reveal-on-scroll body.
export default function Section({ id, index, title, children, className = '' }) {
  const ref = useReveal();
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section-inner reveal" ref={ref}>
        <header className="section-header">
          <span className="section-index">{index}</span>
          <h2 className="section-title">{title}</h2>
          <span className="section-rule" />
        </header>
        {children}
      </div>
    </section>
  );
}
