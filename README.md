# SUJIT PERAMANU // PORTFOLIO

Personal portfolio with a robotics/HUD aesthetic. Built with **React + Vite**
(Node.js toolchain), an interactive **globe.gl** travel page, particle hero,
targeting-reticle cursor, and zero backend — deploys straight to GitHub Pages.

## Quick start

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build into /dist
npm run preview  # serve the production build locally
```

## Where everything lives

| What you want to change         | File                                       |
| ------------------------------- | ------------------------------------------ |
| Name, taglines, about text, skills, contact links | `src/data/profile.js`    |
| Work experience timeline        | `src/data/experience.js`                   |
| Project cards + modals          | `src/data/projects.js`                     |
| Photography grid                | `src/data/photos.js`                       |
| Globe travel pins               | `src/data/travels.js`                      |
| Colors / fonts / theme          | `:root` variables in `src/styles/global.css` |

Components live in `src/components/`, page sections in `src/sections/`,
the globe page in `src/pages/GlobePage.jsx`.

## Adding media

- **Photos** → drop files in `public/assets/photos/`, then add an entry in
  `src/data/photos.js`. Delete the placeholder SVG entries when ready.
- **Videos** → drop `.mp4` files in `public/assets/videos/`, then set
  `video: 'assets/videos/yourfile.mp4'` on a project in `src/data/projects.js`
  (or set `youtube: 'VIDEO_ID'` to embed from YouTube — better for large files).
- **Travel photos** → drop files in `public/assets/travel/`, reference them in
  `src/data/travels.js`. Add new pins with lat/lng from Google Maps
  (right-click any spot → coordinates).
- **Portrait** → add `public/assets/photos/portrait.jpg` and swap the
  placeholder block in `src/sections/About.jsx` (instructions in a comment there).
- **Resume PDF** → drop it at `public/assets/Sujit_Peramanu_Resume.pdf`.

> Tip: keep videos under ~50 MB for GitHub. For anything bigger, upload to
> YouTube (unlisted works) and use the `youtube:` field.

## Contact form (Formspree)

1. Create a free form at [formspree.io](https://formspree.io)
2. Replace `YOUR_FORM_ID` in `src/sections/Contact.jsx`

Until then the form shows a "not configured" notice with your email as fallback.

## Deploying to GitHub Pages

1. Create a repo on GitHub (e.g. `sujit-portfolio`).
2. Push this folder:
   ```bash
   git init
   git add -A
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/sujit-portfolio.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Every push to `main` now auto-builds and deploys via
   `.github/workflows/deploy.yml`. Site appears at
   `https://<your-username>.github.io/sujit-portfolio/`.

## Custom domain (later)

1. Buy a domain (Namecheap, Cloudflare, Porkbun…).
2. GitHub repo → **Settings → Pages → Custom domain** → enter it.
3. At your registrar, add a `CNAME` record pointing `www` →
   `<your-username>.github.io`, and `A` records for the apex domain to GitHub
   Pages IPs (185.199.108.153 / .109. / .110. / .111.).
4. Enable **Enforce HTTPS**. No code changes needed — the build uses relative
   paths and works on any domain.

## Pages

- `/` — Hero, About, Experience, Projects, Photography, Contact
- `#/globe` — interactive 3D travel globe (drag to rotate, click pins)
- `#/robotron` — **ROBO-RAID 2084**, an original Robotron-style twin-stick
  arcade shooter built on the HTML5 Canvas. **WASD** to move, **Arrow keys**
  to shoot in 8 directions, **P** to pause. Rescue the humans, survive the
  waves; high score saves to your browser. (All original code/art — no
  copyrighted assets. Lives in `src/game/robotron.js` + `src/pages/RobotronPage.jsx`.)
