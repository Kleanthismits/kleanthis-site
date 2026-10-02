# Kleanthis Mitsioulis: personal site

Static personal site, served free by GitHub Pages at
https://kleanthismits.github.io/kleanthis-site/. No build step.

## Deploy

Repo **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main` / `/ (root)`.

## Adding a custom domain later

1. Buy a domain and add a CNAME record pointing to `kleanthismits.github.io`.
2. Add a `CNAME` file in the repo root containing the domain, and set it under Settings → Pages.
3. Update the canonical, `og:url` and JSON-LD URLs in `index.html`.

## Edit

- Content: `index.html` (kept in sync by hand with `profile/profile.md` in the private `mark_down_resume` repo)
- Styling: `style.css`
