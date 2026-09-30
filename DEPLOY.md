# Putting the walkthrough at seyonindran.com/gap-walkthrough

The repo is already set up for Netlify: `netlify.toml` tells Netlify how to
build the site, and the build places the walkthrough at `/gap-walkthrough/`.
The bare domain (`seyonindran.com`) forwards there. What's left needs your
accounts: the domain, the Netlify site and the DNS.

Allow about 20 minutes, plus up to a few hours for the domain to go live.

## 1. Register the domain

Buy `seyonindran.com` from any registrar. Cloudflare Registrar, Porkbun and
Namecheap are all fine, at roughly £8–12 a year. Leave its DNS settings
alone for now.

## 2. Create the Netlify site

1. Sign up at [netlify.com](https://www.netlify.com) with **Sign up with GitHub** (free plan).
2. **Add new site → Import an existing project → GitHub**.
3. Allow Netlify to see `seyonindran8-ctrl/HappyRobot` (you can grant access
   to just this repository), then pick it.
4. Netlify reads the settings from `netlify.toml`; you don't need to change
   anything. Check it shows:
   - Branch to deploy: `claude/gap-supply-chain-outreach-71ap0m`
   - Build command: `npm run build:site`
   - Publish directory: `dist-site`
5. **Deploy**. After a minute or two you'll get an address like
   `https://random-name-123.netlify.app`. Open
   `https://random-name-123.netlify.app/gap-walkthrough/` and check it plays.

From then on, every push to that branch redeploys the site automatically.

## 3. Connect seyonindran.com

1. In the Netlify site: **Domain management → Add a domain** → enter
   `seyonindran.com` → confirm you own it.
2. Netlify offers two ways to point the domain at it. Either works:
   - **Easiest: use Netlify DNS.** Netlify shows four nameservers. At your
     registrar, replace the domain's nameservers with those four.
   - **Keep DNS at your registrar.** Add the records Netlify shows. They're
     usually an `A` record for `@` and a `CNAME` for `www` pointing to your
     `….netlify.app` address. Copy the exact values from Netlify's screen.
3. Wait for the change to spread (often minutes, sometimes a few hours).
   Netlify then issues the HTTPS certificate automatically.
4. Open **https://seyonindran.com/gap-walkthrough**. Visiting
   `seyonindran.com` on its own also forwards there.

## Updating it later

Push changes to the branch and Netlify rebuilds within a couple of minutes.
To build and check locally first:

```bash
npm run build:site
npx vite preview --outDir dist-site --base / --port 4173
# open http://localhost:4173/gap-walkthrough/
```

## Notes

- **It's public.** Anyone with the address can open it. The attribution bar
  ("Unofficial concept by Seyon Indran… Not made or endorsed by HappyRobot or
  Gap") stays at the top, and the site asks search engines not to index it
  (a robots meta tag, plus an `X-Robots-Tag` header in `netlify.toml`). To take
  it down after the interview process, delete the site in Netlify
  (**Site configuration → Delete this site**).
- **Adding a homepage later.** Remove the `/` redirect in `netlify.toml` and
  add your homepage's files to the published folder.
- **The claude.ai link keeps working.** It's a separate copy, updated
  separately with `npm run build:artifact`.
