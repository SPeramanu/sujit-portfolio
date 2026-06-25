import { useCallback, useEffect, useRef, useState } from 'react';
import { playlist } from '../data/playlist.js';

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

// Spotify-style mini player for the hero. Single <audio> element driven
// by React state; cycles `playlist` in order, looping at the end.
// Plays local snippets from /public/assets/music/ — if a file is missing
// the UI still works and shows a "drop the file" hint instead of erroring.
export default function MusicPlayer() {
  const audioRef = useRef(null);
  const seekingRef = useRef(false);
  const rootRef = useRef(null);
  const drag = useRef({ active: false, offX: 0, offY: 0 });

  // null until the player is first dragged; afterwards a fixed {x,y} in
  // viewport coords (the element is position:fixed, so it stays put while the
  // page scrolls and can be dropped anywhere on screen).
  const [pos, setPos] = useState(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [missing, setMissing] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = Number(localStorage.getItem('sp-volume'));
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
  });
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const track = playlist[index];

  // keep the element's volume in sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
    localStorage.setItem('sp-volume', String(volume));
  }, [volume, muted]);

  // when the track changes, reset and (if we were playing) continue
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setTime(0);
    setDuration(0);
    setMissing(false);
    a.load();
    if (playing) {
      a.play().catch(() => {}); // ignore autoplay rejections / missing file
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const go = useCallback((delta) => {
    setIndex((i) => (i + delta + playlist.length) % playlist.length);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {
          setMissing(true);
          setPlaying(false);
        });
    }
  }, [playing]);

  const onSeek = (e) => {
    const a = audioRef.current;
    const v = Number(e.target.value);
    setTime(v);
    if (a && Number.isFinite(a.duration)) a.currentTime = v;
  };

  // ---- drag (by the header) -------------------------------------------------
  const onDragStart = (e) => {
    if (e.target.closest('.mp-collapse')) return; // let the collapse button work
    const rect = rootRef.current.getBoundingClientRect();
    drag.current = { active: true, offX: e.clientX - rect.left, offY: e.clientY - rect.top };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const onDragMove = (e) => {
    if (!drag.current.active) return;
    const rect = rootRef.current.getBoundingClientRect();
    // Keep the player clear of the fixed navbar so it can't be dragged under it.
    const navH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10
      ) || 64;
    const minY = navH + 8;
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    const x = Math.max(8, Math.min(maxX, e.clientX - drag.current.offX));
    const y = Math.max(minY, Math.min(maxY, e.clientY - drag.current.offY));
    setPos({ x, y });
  };
  const onDragEnd = (e) => {
    drag.current.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const posStyle = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
    : null;

  return (
    <div
      ref={rootRef}
      className={`music-player hud-frame ${collapsed ? 'collapsed' : ''}`}
      style={{ '--track-accent': track.accent, ...posStyle }}
    >
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => {
          if (!seekingRef.current) setTime(e.target.currentTime);
        }}
        onEnded={() => go(1)}
        onError={() => setMissing(true)}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div
        className="mp-head"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <span className="mp-drag-grip" aria-hidden="true">⠿</span>
        <span className="mp-now">{playing ? 'NOW PLAYING' : 'PAUSED'}</span>
        <span className="mp-count">
          {String(index + 1).padStart(2, '0')}<i>/</i>{String(playlist.length).padStart(2, '0')}
        </span>
        <button
          className="mp-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand player' : 'Collapse player'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▢' : '—'}
        </button>
      </div>

      <div className="mp-body">
        <div className={`mp-vinyl ${playing ? 'spin' : ''}`} aria-hidden="true">
          <span className="mp-vinyl-label" />
          {playing && (
            <span className="mp-eq">
              <i /><i /><i /><i />
            </span>
          )}
        </div>

        <div className="mp-meta">
          <div className="mp-title" title={track.title}>{track.title}</div>
          <div className="mp-artist">{track.artist}</div>
          {missing && (
            <div className="mp-hint">♪ drop {track.src.split('/').pop()} in /public/{track.src.replace(/\/[^/]*$/, '')}/</div>
          )}
        </div>
      </div>

      <div className="mp-scrub">
        <span className="mp-time">{fmt(time)}</span>
        <input
          className="mp-range mp-seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          onPointerDown={() => { seekingRef.current = true; }}
          onPointerUp={() => { seekingRef.current = false; }}
          onChange={onSeek}
          style={{ '--pct': `${duration ? (time / duration) * 100 : 0}%` }}
          aria-label="Seek"
        />
        <span className="mp-time">{fmt(duration)}</span>
      </div>

      <div className="mp-controls">
        <button onClick={() => go(-1)} aria-label="Previous track" title="Previous">⏮</button>
        <button className="mp-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <button onClick={() => go(1)} aria-label="Next track" title="Next">⏭</button>

        <div className="mp-vol">
          <button
            className="mp-mute"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute' : 'Mute'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
          </button>
          <input
            className="mp-range mp-volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted) setMuted(false);
            }}
            style={{ '--pct': `${(muted ? 0 : volume) * 100}%` }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
