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
  {
    id: 'salzburg',
    name: 'Salzburg',
    country: 'Austria',
    lat: 47.8095,
    lng: 13.055,
    date: 'Travel',
    blurb:
      'Baroque old town wedged against the Alps — Mozart’s birthplace and a fortress over the river.',
    images: ['assets/travel/salzburg-1.svg'],
  },
  {
    id: 'verona',
    name: 'Verona',
    country: 'Italy',
    lat: 45.4384,
    lng: 10.9916,
    date: 'Travel',
    blurb:
      'Roman arena, pastel streets, and the gateway to a loop through northern Italy.',
    images: ['assets/travel/verona-1.svg'],
  },
  {
    id: 'venice',
    name: 'Venice',
    country: 'Italy',
    lat: 45.4408,
    lng: 12.3155,
    date: 'Travel',
    blurb:
      'Canals instead of roads. Got lost on purpose between the bridges and the backstreets.',
    images: ['assets/travel/venice-1.svg'],
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    lat: 50.0755,
    lng: 14.4378,
    date: 'Travel',
    blurb:
      'Gothic spires, the astronomical clock, and the castle lit up over the Vltava at night.',
    images: ['assets/travel/prague-1.svg'],
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    lat: 52.52,
    lng: 13.405,
    date: 'Travel',
    blurb:
      'History layered on history — the Wall, Museum Island, and a relentless creative energy.',
    images: ['assets/travel/berlin-1.svg'],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    date: 'Travel',
    blurb:
      'From the Thames to the museums — a city that rewards endless wandering.',
    images: ['assets/travel/london-1.svg'],
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh',
    country: 'Scotland',
    lat: 55.9533,
    lng: -3.1883,
    date: 'Travel',
    blurb:
      'The castle on the crag, the Royal Mile, and dramatic skies over the Old Town.',
    images: ['assets/travel/edinburgh-1.svg'],
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    lat: 41.3874,
    lng: 2.1686,
    date: 'Travel',
    blurb:
      'Gaudí’s impossible geometry, the Gothic Quarter, and the Mediterranean a tram ride away.',
    images: ['assets/travel/barcelona-1.svg'],
  },
  {
    id: 'valencia',
    name: 'Valencia',
    country: 'Spain',
    lat: 39.4699,
    lng: -0.3763,
    date: 'Travel',
    blurb:
      'The futuristic City of Arts and Sciences set against orange groves and old-town plazas.',
    images: ['assets/travel/valencia-1.svg'],
  },
  {
    id: 'kazakhstan',
    name: 'Kazakhstan',
    country: 'Kazakhstan',
    lat: 43.222,
    lng: 76.8512,
    date: 'Travel',
    blurb:
      'Almaty under the Tian Shan mountains — steppe, snow peaks, and Central Asian crossroads.',
    images: ['assets/travel/kazakhstan-1.svg'],
  },
  {
    id: 'kyrgyzstan',
    name: 'Kyrgyzstan',
    country: 'Kyrgyzstan',
    lat: 42.8746,
    lng: 74.5698,
    date: 'Travel',
    blurb:
      'Alpine lakes, mountain passes, and some of the most spectacular terrain on the planet.',
    images: ['assets/travel/kyrgyzstan-1.svg'],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    date: 'Travel',
    blurb:
      'The density and pace of Manhattan — skyline, subway, and everything in between.',
    images: ['assets/travel/new-york-1.svg'],
  },
  {
    id: 'boston',
    name: 'Boston',
    country: 'United States',
    lat: 42.3601,
    lng: -71.0589,
    date: 'Travel',
    blurb:
      'Brick and ivy, the Freedom Trail, and a serious concentration of engineering and research.',
    images: ['assets/travel/boston-1.svg'],
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    country: 'United States',
    lat: 36.1699,
    lng: -115.1398,
    date: 'Travel',
    blurb:
      'Neon in the Mojave — and the launch point for the desert canyons to the east.',
    images: ['assets/travel/las-vegas-1.svg'],
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon',
    country: 'United States',
    lat: 36.1069,
    lng: -112.1129,
    date: 'Travel',
    blurb:
      'A mile deep and impossible to photograph properly. Scale that resets your sense of time.',
    images: ['assets/travel/grand-canyon-1.svg'],
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'United States',
    lat: 34.0522,
    lng: -118.2437,
    date: 'Travel',
    blurb:
      'Pacific coast, palm-lined sprawl, and sunshine from the hills to the shore.',
    images: ['assets/travel/los-angeles-1.svg'],
  },
];
