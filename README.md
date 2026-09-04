# Baltic Foundation for Future Education — website

Static bilingual (LV / EN) website for Nodibinājums "Baltic Foundation for Future Education",
a non-profit foundation in Riga, Latvia.

Pure HTML, CSS and vanilla JavaScript — no frameworks, no build step. All paths are relative,
so the site can be served from any static host, including GitHub Pages project sites.

## Structure

```
index.html               single page, anchor navigation
assets/css/styles.css    all styling (design tokens at the top)
assets/js/content.js     ALL SITE TEXT, Latvian and English
assets/js/main.js        language switching, menu, scroll reveal, contact form
.nojekyll                tells GitHub Pages to serve files as-is
```

## Editing the text

Every visible string lives in `assets/js/content.js`, in two blocks: `lv` and `en`.
Find the key and change the text between the quotes:

```js
"hero.tagline": 'Veidojam nākotnes izglītību',
```

HTML elements are bound to keys through attributes:

| Attribute | Effect |
|---|---|
| `data-i18n="key"` | replaces the element's text |
| `data-i18n-html="key"` | replaces the element's HTML (use when the text contains `<br>`) |
| `data-i18n-placeholder="key"` | sets an input placeholder |
| `data-i18n-aria-label="key"` | sets an `aria-label` |

Both languages must define the same keys. Latvian is the default; the choice is remembered
in `localStorage` and can be forced with `?lang=en`.

## Placeholders to replace

Values in `[square brackets]` are placeholders:

- founder name and bio (`about.founder.*`)
- supervisory board members (`about.board.text`)
- registration number, legal address, public benefit status (`about.reg.*`, `footer.reg`)
- phone number and address in the footer (`footer.phone`, `footer.address`)
- LinkedIn and YouTube URLs (in `index.html`, in the footer `.social` block)

The contact address `info@balticfoundation.lv` appears in `index.html` (footer and form note)
and in `main.js` (the `EMAIL` constant) — change it in both places.

## Design

- Deep navy `#1B2A4A` with a warm amber accent `#E8A33D`
- Inter, loaded from Google Fonts, with a system-font fallback stack
- Responsive and mobile-first; scroll animations respect `prefers-reduced-motion`
- The hero composition is built from CSS shapes, not a photo

Design tokens live in the `:root` block at the top of `assets/css/styles.css`.

## Images

`assets/img/*.webp` — one photo per direction, reused both as the card thumbnail
(`.card__media`, on the homepage grid) and as the supporting image beside that
direction's detail-section heading (`.detail__media`). All from Pexels (free
licence, no attribution required, commercial use allowed), cropped to 16:9,
resized to 1600px wide and compressed to WebP:

| File | Pexels photo ID |
|---|---|
| `skolam.webp` | [6345058](https://www.pexels.com/photo/6345058/) |
| `pedagogiem.webp` | [18999475](https://www.pexels.com/photo/18999475/) |
| `profesionalajai.webp` | [7480452](https://www.pexels.com/photo/7480452/) |
| `jauniesiem.webp` | [14501973](https://www.pexels.com/photo/14501973/) |
| `ai.webp` | [8108716](https://www.pexels.com/photo/8108716/) |
| `pieaugusajiem.webp` | [6334270](https://www.pexels.com/photo/6334270/) |
| `programmas.webp` | [8518812](https://www.pexels.com/photo/8518812/) |

Alt text for every image lives in `content.js` under the `img.*.alt` keys (both
languages) and is applied via `data-i18n-alt` — the same pattern as
`data-i18n-placeholder` and `data-i18n-aria-label`. To swap a photo: replace the
`.webp` file (same crop/size/compression), keep the filename, and update the
matching `img.*.alt` text if the new photo shows something different.

## Running locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

Repository → **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
The site is published within a minute or two at `https://<user>.github.io/<repo>/`.

## Contact form

The form is static: it validates the required fields and opens a pre-filled message in the
visitor's email client (`mailto:`). There is no server. To collect submissions properly, point
the `<form>` at a form service (Formspree, Getform, Netlify Forms) and remove the `mailto`
handler at the bottom of `main.js`.
