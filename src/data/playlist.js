// ============================================================
//  PLAYLIST — tracks for the hero "now playing" mini-player.
//
//  HOW TO ADD AUDIO (the player works without it, but stays
//  silent until the files exist):
//    1. Grab a short snippet (15–30s is plenty, keeps the repo
//       small and stays comfortably in fair-use territory).
//    2. Save it as an .mp3 in  /public/assets/music/  using the
//       exact filename in `src` below (e.g. rocket-man.mp3).
//    3. That's it — the player auto-detects and plays it.
//
//  Don't commit full copyrighted tracks to a public GitHub repo.
//  Short personal snippets only. The player cycles this array in
//  order and loops back to the top after the last track.
//
//  `accent` just tints that track's vinyl + glow.
// ============================================================

export const playlist = [
  { id: 'rocket-man',  title: 'Rocket Man',                 artist: 'Elton John',       src: 'assets/music/rocket-man.mp3',  accent: '#ff9f1c' },
  { id: 'back-in-black', title: 'Back in Black',            artist: 'AC/DC',            src: 'assets/music/back-in-black.mp3', accent: '#ff3b5c' },
  { id: 'heavens-door', title: "Knockin' on Heaven's Door", artist: 'Bob Dylan',        src: 'assets/music/heavens-door.mp3', accent: '#6aa9ff' },
  { id: 'get-lucky',   title: 'Get Lucky',                  artist: 'Daft Punk',        src: 'assets/music/get-lucky.mp3',   accent: '#ff3cf0' },
  { id: 'watchtower',  title: 'All Along the Watchtower',   artist: 'Jimi Hendrix',     src: 'assets/music/watchtower.mp3',  accent: '#9b6bff' },
  { id: 'beat-it',     title: 'Beat It',                    artist: 'Michael Jackson',  src: 'assets/music/beat-it.mp3',     accent: '#ff5050' },
  { id: 'horse',       title: 'A Horse with No Name',       artist: 'America',          src: 'assets/music/horse.mp3',       accent: '#7dffb0' },

  // ---- 10th slot: add your own. Rename and drop in a file. ----
  // { id: 'track-10', title: 'Your Pick', artist: 'Artist', src: 'assets/music/track-10.mp3', accent: '#00f0ff' },
];
