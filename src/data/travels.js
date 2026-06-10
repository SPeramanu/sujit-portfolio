// ============================================================
//  TRAVELS — pins on the interactive globe (#/globe page).
//
//  To add a location:
//    1. Find its latitude/longitude (right-click in Google Maps).
//    2. Drop photos into /public/assets/travel/
//    3. Add an entry below. Done — the globe picks it up.
//
//  Pins are connected by arcs in array order (your journey line).
// ============================================================

export const travels = [
  {
    id: 'calgary',
    name: 'Calgary',
    country: 'Canada',
    lat: 51.0447,
    lng: -114.0719,
    date: 'Home base',
    blurb:
      'Where it all started. Two summers at TEKTELIC building test automation for IoT gateways.',
    images: ['assets/travel/calgary-1.svg'],
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    date: '2021 — Present',
    blurb:
      'Engineering Science at UofT. Surgical robotics research at MEDCVR, rover software with the Autonomous Rover Team.',
    images: ['assets/travel/toronto-1.svg'],
  },
  {
    id: 'ottawa',
    name: 'Ottawa',
    country: 'Canada',
    lat: 45.4215,
    lng: -75.6972,
    date: 'Nov 2024 — Aug 2025',
    blurb:
      'Mission Control Space Services — lunar rover mission software for the Astrobotic CubeRover mission.',
    images: ['assets/travel/ottawa-1.svg'],
  },
  {
    id: 'munich',
    name: 'Munich',
    country: 'Germany',
    lat: 48.1351,
    lng: 11.582,
    date: 'Jul 2024 — Oct 2024',
    blurb:
      'OHB System AG — KUKA force-torque control for satellite component testing. Weekends in the Alps.',
    images: ['assets/travel/munich-1.svg'],
  },
];
