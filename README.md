# kleanthis.mitsioulis.com

Static personal site, served by GitHub Pages. No build step.

## Deploy

1. Create a new **public** repo (e.g. `Kleanthismits/kleanthis-site`) and push this folder to `main`.
2. Repo **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main` / `/ (root)`.
3. Same page: Custom domain = `kleanthis.mitsioulis.com` (the `CNAME` file already sets this), then tick **Enforce HTTPS** once the certificate is issued.

## DNS

At the DNS provider for `mitsioulis.com`, add:

| Type  | Name        | Value                     |
|-------|-------------|---------------------------|
| CNAME | `kleanthis` | `kleanthismits.github.io` |

Propagation can take from minutes to a few hours.

## Edit

- Content: `index.html` (kept in sync by hand with `profile/profile.md` in the private `mark_down_resume` repo)
- Styling: `style.css`
