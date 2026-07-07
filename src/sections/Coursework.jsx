import { useLayoutEffect, useRef } from 'react';
import Section from '../components/Section.jsx';
import { coursework } from '../data/coursework.js';

// The bullet area of the tallest tile in a row is allowed to grow to at
// most this height; that tile then sets the row height and every other
// tile's scroll container is stretched to match (see useEqualRowBullets).
const DEFAULT_MAX_BULLETS = 150;

// Per visual row: measure each tile's non-bullet "chrome" (header, title,
// links, padding) and its natural bullet-content height. The row height is
// max(chrome + min(content, 150)); every tile's bullet container is then set
// to rowHeight − chrome so all tiles in the row are exactly the same height,
// the bullets fill the available space, and a scrollbar appears only when the
// content is taller than the space it's given.
function useEqualRowBullets(gridRef) {
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let raf = 0;

    const layout = () => {
      const tiles = Array.from(grid.querySelectorAll('.course-tile'));
      if (!tiles.length) return;
      const lists = tiles.map((t) => t.querySelector('.course-bullets'));

      // 1) measure natural sizes: opt tiles out of grid stretch and let the
      //    bullet lists take their content height.
      tiles.forEach((t, i) => {
        t.style.alignSelf = 'start';
        if (lists[i]) lists[i].style.height = 'auto';
      });
      const chrome = tiles.map((t, i) => t.offsetHeight - (lists[i]?.offsetHeight || 0));
      const content = lists.map((l) => (l ? l.scrollHeight : 0));

      // 2) how many columns is the grid currently showing?
      const cols =
        getComputedStyle(grid)
          .gridTemplateColumns.split(' ')
          .filter(Boolean).length || 1;

      // 3) walk row by row (DOM order is row-major in a CSS grid).
      for (let start = 0; start < tiles.length; start += cols) {
        const row = [];
        for (let k = start; k < Math.min(start + cols, tiles.length); k++) row.push(k);

        let rowH = 0;
        for (const i of row) {
          rowH = Math.max(rowH, chrome[i] + Math.min(content[i], DEFAULT_MAX_BULLETS));
        }
        for (const i of row) {
          if (!lists[i]) continue;
          // clear the CSS max-height fallback so the container can grow past
          // 150px when it needs to fill a taller row
          lists[i].style.maxHeight = 'none';
          lists[i].style.height = `${Math.max(0, Math.round(rowH - chrome[i]))}px`;
        }
      }

      // 4) restore normal flow (heights are now explicit, so stretch is a no-op).
      tiles.forEach((t) => {
        t.style.alignSelf = '';
      });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };

    layout(); // run synchronously before first paint to avoid a flash
    const ro = new ResizeObserver(schedule);
    ro.observe(grid);
    window.addEventListener('resize', schedule);
    // fonts can shift heights after they load
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [gridRef]);
}

export default function Coursework() {
  const gridRef = useRef(null);
  useEqualRowBullets(gridRef);

  return (
    <Section id="coursework" index="03" title="Coursework">
      <div className="course-grid" ref={gridRef}>
        {coursework.map((c) => (
          <article
            key={c.code}
            className="course-tile"
            style={{ '--tile-accent': c.accent }}
          >
            <div className="course-head">
              <span className="course-code">{c.code}</span>
              {c.term && <span className="course-term">{c.term}</span>}
            </div>
            <h3 className="course-title">{c.title}</h3>
            <ul className="course-bullets">
              {c.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {c.links.length > 0 && (
              <div className="course-links">
                {c.links.map((l) => (
                  <a
                    key={l.url + l.label}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="course-link"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
