# SoulMend — one-page site

Static site, no build step. Everything the page needs is in this folder.

```
index.html        English page
ka/index.html     Georgian page (same structure; keep the two in sync)
assets/css/site.css   shared styles
assets/js/services.js     treatments, prices, specifications and quiz questions (EN + KA) — edit content here
assets/js/treatments.js   builds the card rows, the treatment details window and the quiz from services.js
assets/js/site.js     shared scripts (header, hero, cards, booking section)
assets/js/config.example.js   template for config.js (booking link); config.js itself is not in Git
.github/workflows/pages.yml   deploys to GitHub Pages and writes config.js from the BOOKING_URL variable
favicon.svg       crescent mark
assets/logo.svg   full logo (vector, recolorable)
assets/img/       cleaned photos, 4x Real-ESRGAN upscale, WebP at 800/1600/2400w
.nojekyll         tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages
1. Push this folder to the repository root (currently `Acheez/soulmend-web`).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Every push to `main` runs the "Deploy site" workflow. The site appears at `https://acheez.github.io/soulmend-web/` (Georgian: `/ka/`) within a minute or two.
4. Custom domain (optional): add it under Settings → Pages, point the domain's DNS at GitHub, then replace
   `https://acheez.github.io/soulmend-web/` in the `<head>` of both pages (canonical, hreflang, og:image, JSON-LD).

## Languages
- English at `/`, Georgian at `/ka/`. The EN/ქა switch in the header keeps the visitor on the same section and
  remembers the choice. Visitors whose browser is set to Georgian are sent to `/ka/` unless they picked English.
- Any text change must be made in both `index.html` and `ka/index.html`.

## Treatments, prices and the quiz
- Everything about the individual treatments lives in `assets/js/services.js`, in both languages: names,
  durations, prices, "good for", areas, intensity and safety notes. A change there updates the cards' duration
  and price summary, the details window and the quiz on both pages.
- Each card is an overview of its group (title, intro and highlights are in the HTML of each page). Its Book
  button opens the details window, where the visitor picks the treatment and duration, then books online
  (Google Calendar) or on WhatsApp with the massage, duration and price already written in the message.
- The "find your massage" quiz sits at the top of Treatments (its first question is shown on the page) and is
  also linked from First visit. Questions are at the bottom of `services.js`; `multi: true` allows several
  answers; each service's `quiz` field says which answers it suits.

## Therapists
- Cards are in the "THERAPISTS" section of both pages. To add someone, copy the commented card template in
  `index.html`, put a 4:5 portrait in `assets/img/team/`, and add the same card to `ka/index.html`.

## Online booking (Google Calendar appointment schedule)
The booking link is kept out of Git, like an environment variable.
- **Live site:** Settings → Secrets and variables → Actions → **Variables** → New repository variable
  `BOOKING_URL` = your link. To change it later, edit the variable, then Actions → Deploy site → **Run workflow**.
  The workflow writes it into `assets/js/config.js` at deploy time.
- **On your computer:** copy `assets/js/config.example.js` to `assets/js/config.js` and paste the link there.
  `config.js` is in `.gitignore`, so it is never committed.
- No link set → the "Book a session" button and the "Book online" section stay hidden; phone/WhatsApp still work.
- Use the long link (`https://calendar.google.com/calendar/appointments/schedules/…`): it works for the buttons
  and the calendar is embedded on the page. The short `https://calendar.app.google/…` link works for the buttons
  only — Google blocks it from being embedded, so the section shows the steps and a button instead.
- Note: the link is not a password. Anyone visiting the site can see it in the booking button.
- A free Google account has one booking page and no custom form questions, so Google can't record which
  massage was picked; WhatsApp carries that instead. On a paid Google Workspace plan you can make one booking
  page per card and set `BOOKING_URL_RELAX`, `…_THERAPEUTIC`, `…_SPORTS`, `…_BODY`, `…_FACIAL`
  (or `bookingUrls` in config.js); those cards then book straight into their own page.

## Before launch — search for `TODO(client)`
- Prices, durations and specifications in `assets/js/services.js` are placeholders — confirm them
- Givi Khobua: years of experience, certificates, and which services he does
- Sports card: reuses a crop of the back photo until there is a sports photo
- Opening hours (optional), in the contact section
- Georgian copy: worth a read-through by a native speaker
- Tagline spelling: the logo artwork says "Renewall"; the site uses "Renewal"

## Light version
The site is dark by default. To switch to the light version, change the first tag of both pages to
`<html lang="en" data-theme="light">` / `<html lang="ka" data-theme="light">`.
