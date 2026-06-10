import { useEffect, useState } from 'react';

// Full project dossier: media viewer (YouTube embed > local video > image
// gallery, in that priority) + description. Esc or backdrop click closes.
export default function ProjectModal({ project, onClose }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!project) return null;

  const hasGallery = project.images && project.images.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal hud-frame"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <div className="modal-titlebar">
          <span className="modal-file">FILE://{project.id.toUpperCase()}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            [ X ]
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-media">
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
                  className="modal-main-img"
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

          <div className="modal-info">
            <h3>{project.title}</h3>
            <p className="modal-subtitle">{project.subtitle}</p>
            <div className="modal-meta">
              <span>{project.role}</span>
              <span>{project.period}</span>
            </div>
            <div className="modal-tags">
              {project.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            {project.description.map((para, i) => (
              <p key={i} className="modal-desc">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
