# SoulMend — one-page site

Static site, no build step. Everything the page needs is in this folder.

```
index.html        page, styles and scripts
favicon.svg       crescent mark
assets/logo.svg   full logo (vector, recolorable)
assets/img/       cleaned photos, 4x Real-ESRGAN upscale, WebP at 800/1600/2400w
```

## Publish on GitHub Pages
1. Create a repository (e.g. `soulmend`) and upload the contents of this folder to the root.
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/soulmend/` within a minute or two.
4. Custom domain (optional): add it under Settings → Pages, then point the domain's DNS at GitHub.

## Before launch — search index.html for `TODO(client)`
- Treatments, durations and prices (all current values are placeholders)
- Address and opening hours, if wanted for Google (JSON-LD block in `<head>`)
- Tagline spelling: the logo artwork says "Renewall"; the site uses "Renewal"

## Light version
The site is dark by default. To switch to the light version, change the first tag in index.html to
`<html lang="en" data-theme="light">`.
