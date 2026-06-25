// ============================================================
//  TRAVELS — pins on the interactive globe (#/globe page).
//
//  To add a location:
//    1. Find its latitude/longitude (right-click in Google Maps).
//    2. Drop photos into /public/assets/travel/<FolderName>/
//    3. Add an entry below. Done — the globe picks it up.
//
//  Each location supports multiple images — they render as a
//  slideshow with thumbnails in the side panel.
//  Images are auto-discovered from /public/assets/travel/<folder>/
//
//  Pins are connected by arcs in array order (your journey line).
// ============================================================

function loadImages(glob) {
  return Object.keys(glob)
    .sort()
    .map((p) => p.replace('/public/', ''));
}

const folders = {
  calgary:    loadImages(import.meta.glob('/public/assets/travel/Calgary/*.{jpg,jpeg,png,webp}',       { eager: true })),
  toronto:    loadImages(import.meta.glob('/public/assets/travel/Toronto/*.{jpg,jpeg,png,webp}',       { eager: true })),
  montreal:   loadImages(import.meta.glob('/public/assets/travel/Mtl/*.{jpg,jpeg,png,webp}',           { eager: true })),
  ottawa:     loadImages(import.meta.glob('/public/assets/travel/Ottawa/*.{jpg,jpeg,png,webp}',        { eager: true })),
  boston:      loadImages(import.meta.glob('/public/assets/travel/Boston/*.{jpg,jpeg,png,webp}',        { eager: true })),
  'new-york': loadImages(import.meta.glob('/public/assets/travel/NYC/*.{jpg,jpeg,png,webp}',           { eager: true })),
  phoenix:    loadImages(import.meta.glob('/public/assets/travel/Pheonix/*.{jpg,jpeg,png,webp}',       { eager: true })),
  'las-vegas':loadImages(import.meta.glob('/public/assets/travel/LV/*.{jpg,jpeg,png,webp}',            { eager: true })),
  'grand-canyon': loadImages(import.meta.glob('/public/assets/travel/Grand Canyone/*.{jpg,jpeg,png,webp}', { eager: true })),
  'costa-rica': loadImages(import.meta.glob('/public/assets/travel/Costa Rica/*.{jpg,jpeg,png,webp}',  { eager: true })),
  uk:         loadImages(import.meta.glob('/public/assets/travel/UK/*.{jpg,jpeg,png,webp}',            { eager: true })),
  spain:      loadImages(import.meta.glob('/public/assets/travel/Spain/*.{jpg,jpeg,png,webp}',         { eager: true })),
  germany:    loadImages(import.meta.glob('/public/assets/travel/Germany/*.{jpg,jpeg,png,webp}',       { eager: true })),
  austria:    loadImages(import.meta.glob('/public/assets/travel/Austria/*.{jpg,jpeg,png,webp}',       { eager: true })),
  switzerland:loadImages(import.meta.glob('/public/assets/travel/Switzerland/*.{jpg,jpeg,png,webp}',   { eager: true })),
  italy:      loadImages(import.meta.glob('/public/assets/travel/Italy/*.{jpg,jpeg,png,webp}',         { eager: true })),
  'czech-republic': loadImages(import.meta.glob('/public/assets/travel/Chezch/*.{jpg,jpeg,png,webp}', { eager: true })),
  kyrgyzstan: loadImages(import.meta.glob('/public/assets/travel/Kyrgyzstan/*.{jpg,jpeg,png,webp}',    { eager: true })),
};

export const travels = [
  {
    id: 'calgary',
    name: 'Calgary',
    country: 'Canada',
    lat: 51.0447,
    lng: -114.0719,
    date: 'Home base',
    blurb: '',
    images: folders.calgary,
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    date: '2021 — Present',
    blurb: '',
    images: folders.toronto,
  },
  {
    id: 'montreal',
    name: 'Montreal',
    country: 'Canada',
    lat: 45.5017,
    lng: -73.5673,
    date: 'Travel',
    blurb: '',
    images: folders.montreal,
  },
  {
    id: 'ottawa',
    name: 'Ottawa',
    country: 'Canada',
    lat: 45.4215,
    lng: -75.6972,
    date: 'Nov 2024 — Aug 2025',
    blurb: '',
    images: folders.ottawa,
  },
  {
    id: 'boston',
    name: 'Boston',
    country: 'United States',
    lat: 42.3601,
    lng: -71.0589,
    date: 'Travel',
    blurb: '',
    images: folders.boston,
  },
  {
    id: 'new-york',
    name: 'New York City',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    date: 'Travel',
    blurb: '',
    images: folders['new-york'],
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    country: 'United States',
    lat: 33.4484,
    lng: -112.074,
    date: 'Travel',
    blurb: '',
    images: folders.phoenix,
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    country: 'United States',
    lat: 36.1699,
    lng: -115.1398,
    date: 'Travel',
    blurb: '',
    images: folders['las-vegas'],
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon',
    country: 'United States',
    lat: 36.1069,
    lng: -112.1129,
    date: 'Travel',
    blurb: '',
    images: folders['grand-canyon'],
  },
  {
    id: 'costa-rica',
    name: 'Costa Rica',
    country: 'Costa Rica',
    lat: 9.7489,
    lng: -83.7534,
    date: 'Travel',
    blurb: '',
    images: folders['costa-rica'],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    date: 'Travel',
    blurb: '',
    images: folders.uk,
  },
  {
    id: 'spain',
    name: 'Spain',
    country: 'Spain',
    lat: 41.3874,
    lng: 2.1686,
    date: 'Travel',
    blurb: '',
    images: folders.spain,
  },
  {
    id: 'germany',
    name: 'Germany',
    country: 'Germany',
    lat: 48.1351,
    lng: 11.582,
    date: 'Jul 2024 — Oct 2024',
    blurb: '',
    images: folders.germany,
  },
  {
    id: 'austria',
    name: 'Austria',
    country: 'Austria',
    lat: 47.8095,
    lng: 13.055,
    date: 'Travel',
    blurb: '',
    images: folders.austria,
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    country: 'Switzerland',
    lat: 46.8182,
    lng: 8.2275,
    date: 'Travel',
    blurb: '',
    images: folders.switzerland,
  },
  {
    id: 'italy',
    name: 'Italy',
    country: 'Italy',
    lat: 45.4408,
    lng: 12.3155,
    date: 'Travel',
    blurb: '',
    images: folders.italy,
  },
  {
    id: 'czech-republic',
    name: 'Czech Republic',
    country: 'Czech Republic',
    lat: 50.0755,
    lng: 14.4378,
    date: 'Travel',
    blurb: '',
    images: folders['czech-republic'],
  },
  {
    id: 'kyrgyzstan',
    name: 'Kyrgyzstan',
    country: 'Kyrgyzstan',
    lat: 42.8746,
    lng: 74.5698,
    date: 'Travel',
    blurb: '',
    images: folders.kyrgyzstan,
  },
];
