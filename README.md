# Ajay Kumar Koilathachetta — Portfolio

Personal portfolio of Ajay Kumar Koilathachetta, Software Engineer II (Founding Engineer) at Lenity Health. A minimalist, dark, single-page site built with [Next.js](https://nextjs.org) (App Router) and [Tailwind CSS](https://tailwindcss.com), set in Geist.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```

## Editing content

All resume content (experience, skills, achievements, links) lives in one place: [`src/lib/data.ts`](src/lib/data.ts). Edit that file to update the site — no component changes needed for routine updates.

## Deploying to Vercel

1. Push this repo to GitHub:

   ```bash
   gh repo create ajay-portfolio --public --source=. --push
   # or create a repo on github.com and:
   # git remote add origin https://github.com/ajaykumarkc/ajay-portfolio.git
   # git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import the repository. Vercel auto-detects Next.js — no configuration needed. Click **Deploy**.

3. Every push to `main` will redeploy automatically.

### Custom domain (later)

In your Vercel project go to **Settings → Domains**, add your domain (e.g. `ajaykumar.dev`), and point your registrar's DNS at Vercel (an `A` record to `76.76.21.21` or a `CNAME` to `cname.vercel-dns.com` — Vercel shows the exact records to add). Then update `site.url` in `src/lib/data.ts` so Open Graph URLs use the new domain.
