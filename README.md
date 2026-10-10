# aloncohen.dev

Personal site. Next.js App Router on Netlify.

- Copy lives only under `content/`. Components lay it out.
- `npm run build` runs `scripts/content-check.mjs` first: it fails on a client name that must stay unnamed, or an em-dash.
- `public/__forms.html` is the static copy of the contact form that Netlify Forms registers at build time.
- The photo is `public/alon.jpg`.
