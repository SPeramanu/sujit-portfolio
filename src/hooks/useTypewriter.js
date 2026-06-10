import { useEffect, useState } from 'react';

// Cycles through `phrases` with a type / pause / delete loop.
export default function useTypewriter(phrases, { typeMs = 65, deleteMs = 30, holdMs = 2200 } = {}) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState({ idx: 0, deleting: false });

  useEffect(() => {
    const phrase = phrases[phase.idx % phrases.length];
    let timer;

    if (!phase.deleting) {
      if (text.length < phrase.length) {
        timer = setTimeout(() => setText(phrase.slice(0, text.length + 1)), typeMs);
      } else {
        timer = setTimeout(() => setPhase((p) => ({ ...p, deleting: true })), holdMs);
      }
    } else if (text.length > 0) {
      timer = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
    } else {
      setPhase((p) => ({ idx: (p.idx + 1) % phrases.length, deleting: false }));
    }
    return () => clearTimeout(timer);
  }, [text, phase, phrases, typeMs, deleteMs, holdMs]);

  return text;
}
