import { useState } from 'react';
import Section from '../components/Section.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { photos } from '../data/photos.js';

export default function Photography() {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  return (
    <Section id="photography" index="04" title="OPTICAL SENSOR ARCHIVE">
      <p className="section-lede">
        Shots from wherever the work takes me. Click any frame to inspect.
      </p>
      <div className="masonry">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            className="masonry-item"
            onClick={() => setLightboxIdx(i)}
            aria-label={`View ${photo.caption}`}
          >
            <img src={photo.src} alt={photo.caption} loading="lazy" />
            <span className="masonry-caption">
              <span className="tag">{photo.tag}</span>
              {photo.caption}
            </span>
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNavigate={setLightboxIdx}
        />
      )}
    </Section>
  );
}
