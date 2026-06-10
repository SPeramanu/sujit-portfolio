import { useEffect, useRef, useState } from 'react';

const BOOT_LINES = [
  'SP-OS v4.1 // INITIALIZING...',
  '> mounting /dev/portfolio ............ OK',
  '> loading kinematics module .......... OK',
  '> calibrating perception stack ....... OK',
  '> establishing uplink ................ OK',
  '> all systems nominal',
  'WELCOME, OPERATOR.',
];

// Terminal boot sequence shown once per session. Click / key skips it.
export default function BootOverlay() {
  const [visible, setVisible] = useState(
    () => !sessionStorage.getItem('sp-booted')
  );
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';

    BOOT_LINES.forEach((line, i) => {
      timers.current.push(setTimeout(() => setLines((l) => [...l, line]), 180 * i + 100));
    });
    timers.current.push(setTimeout(finish, 180 * BOOT_LINES.length + 500));

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function finish() {
    sessionStorage.setItem('sp-booted', '1');
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 450);
  }

  if (!visible) return null;

  return (
    <div className={`boot-overlay ${fading ? 'fading' : ''}`}>
      <div className="boot-terminal">
        {lines.map((l, i) => (
          <div key={i} className={`boot-line ${i === BOOT_LINES.length - 1 ? 'boot-welcome' : ''}`}>
            {l}
          </div>
        ))}
        <div className="boot-cursor">█</div>
        <div className="boot-skip">[ CLICK TO SKIP ]</div>
      </div>
    </div>
  );
}
