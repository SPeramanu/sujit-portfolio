import { useCallback, useEffect } from 'react';

// Photography lightbox with keyboard navigation (←/→/Esc).
export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const prev = useCallback(
    () => onNavigate((index - 1 + photos.length) % photos.length),
    [index, photos.length, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((index + 1) % photos.length),
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  if (index === null) return null;
  const photo = photos[index];

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-topbar">
          <span className="lightbox-counter">
            IMG {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            [ X ]
          </button>
        </div>
        <div className="lightbox-stage">
          <button className="lightbox-nav prev" onClick={prev} aria-label="Previous">
            ◄
          </button>
          <img src={photo.src} alt={photo.caption} />
          <button className="lightbox-nav next" onClick={next} aria-label="Next">
            ►
          </button>
        </div>
        <div className="lightbox-caption">
          <span className="tag">{photo.tag}</span>
          {photo.caption}
        </div>
      </div>
    </div>
  );
}
