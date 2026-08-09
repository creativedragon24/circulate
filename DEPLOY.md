# 🚀 Deploy Limber to GitHub Pages

The project is **pre-configured for GitHub Pages**: relative asset paths (`base: './'`),
relative PWA manifest/scope, and hash routing — so it works from the subpath
(`https://<user>.github.io/<repo>/`) with no extra config. Verified by a subpath
simulation test (`tools/test-ghpages.mjs`).

---

## Step 1 — Create the GitHub repo

1. Go to https://github.com/new
2. Repo name: `limber` (or anything you like)
3. **Public** (free Pages; private repos need a paid plan)
4. Don't tick "Add a README" / ".gitignore" — we have our own
5. Create repo

## Step 2 — Push the project

From your machine, inside the project folder:

```bash
cd limber

git init
git add .
git commit -m "Limber — free offline stretching PWA"

git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/limber.git
git push -u origin main
```

## Step 3 — Turn on GitHub Pages

1. On GitHub, open the repo → **Settings** → **Pages** (left sidebar)
2. Under **Build and deployment** → **Source**, pick **GitHub Actions**
3. That's it — the workflow already exists in `.github/workflows/deploy.yml`

## Step 4 — Watch it deploy

1. Open the repo → **Actions** tab
2. You'll see the **"Deploy to GitHub Pages"** workflow running (build → deploy)
3. When both jobs turn green, your site is live at:

```
https://<YOUR-USERNAME>.github.io/limber/
```

## Every future update

Just `git push` — the workflow rebuilds and redeploys automatically. ✨

---

## If the deploy fails

| Symptom | Fix |
|---|---|
| Workflow never runs | Make sure the branch is named `main` (`git branch -M main`) and the push was `git push -u origin main` |
| "Pages" source not set | Settings → Pages → Source → **GitHub Actions** |
| Old version cached | Hard-refresh (Ctrl/Cmd+Shift+R) or reinstall the PWA once |
| npm ci fails | Check `package-lock.json` is committed (it is) |

## Alternatives

- **Manual deploy**: `npm run build && npx gh-pages -d dist` (pushes `dist` to a `gh-pages` branch; then set Pages source to "Deploy from a branch" → `gh-pages`)
- **Cloudflare Pages / Netlify / Vercel**: just point them at the repo — zero config, often faster first deploy. Then the URL is `https://<project>.pages.dev` etc.

## Notes

- The PWA works on GitHub Pages: installable ("Add to Home Screen"), offline-capable, auto-updating service worker — all verified under a simulated subpath.
- Hash routing (`#/app`, `#/mobile`) means no 404s for app routes on Pages.
