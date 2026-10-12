# aloncohen.dev

Personal site. Next.js App Router on Netlify.

- Copy lives only under `content/`. Components lay it out.
- `npm run build` runs `scripts/content-check.mjs` first: it fails on a client name that must stay unnamed, or an em-dash.
- The photo is `public/alon.jpg`. The About section shows it only once that file exists.

## The hero

The hero is a 3D scene (`components/hero/Platform.tsx` and `components/hero/platform/`) that the page never runs. It is rendered once to video, and the page plays the video (`components/hero/HeroVideo.tsx`):

- `public/hero/intro.mp4` is the build.
- `public/hero/loop.mp4` is one full turn, which joins to itself.
- `public/hero/intro-sm.mp4` and `loop-sm.mp4` are the same clips at 720 wide, for phones.
- `public/hero/still.jpg` is what a visitor with reduced motion sees, and what stands in when the browser will not play the video (iOS in Low Power Mode) or the intro has not started within a few seconds.

After any change to the scene, render it again and commit the five files:

    npm run dev            # in one terminal
    npm run render:hero    # in another; needs ffmpeg, takes about ten minutes

`/?capture=1` shows the live scene, which is what the render script drives. `node scripts/render-hero.mjs --encode-only` encodes the frames already captured again, to try another size or quality.

## The contact form

Netlify Forms. `public/__forms.html` is the static copy that Netlify registers at deploy time, and the component posts to that path. Two settings on the Netlify site make it work, and neither is in this repo: form detection is switched on, and an email notification is set for new submissions.

## Checks

    npm run typecheck && npm run lint && npm run check && npm test && npm run build

`npm test` starts the dev server if none is running. `BASE_URL=https://...` points it at any other address.

## Deploying

This branch (`v3`) deploys on every push as a Netlify branch deploy, at `v3--alon-portolio-website.netlify.app`. The public domain still serves `main`, the previous site, which sends visitors in Israel here (`netlify/edge-functions/israel.js` on `main`). To move everyone over: merge `v3` into `main`, and delete that edge function and its entry in `netlify.toml`.
