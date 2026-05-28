# LAMBOMODELS — Site Documentation

Everything you need to know to maintain and expand the site. No coding required for most tasks.

---

## File Structure

```
lambomodels/
├── index.html              Homepage
├── collection.html         Collection browser (By Model + All Models views)
├── model-group.html        Family page (e.g. all Aventadors)
├── model.html              Individual model page
├── stats.html              Statistics page
├── search.html             Search results
├── compare.html            Side-by-side model comparison (up to 4)
├── catalogue.html          Print/PDF catalogue (admin-only, see below)
├── memorabilia.html        Memorabilia catalogue
├── memo-item.html          Individual memorabilia item page
├── blog.html               Blog listing
├── blog-post.html          Individual blog post
├── about.html              About page
├── disclaimer.html         Disclaimer & Terms of Use
│
├── css/style.css           All site styles
│
├── js/
│   ├── data.js             Core data layer — CSV parsing, categories, tags, helpers
│   ├── blog-data.js        Blog posts content
│   ├── memorabilia-data.js Legacy (unused — memorabilia now comes from CSV)
│   └── shelves.js          Future feature placeholder
│
├── data/
│   ├── collection.csv      Your model collection data
│   ├── memorabilia.csv     Your memorabilia data
│   ├── descriptions.json   Per-model descriptions and tags
│   └── site-config.json    Site-wide settings (latest addition, milestones)
│
└── images/                 All photos (see naming conventions below)
```

---

## Image Naming Conventions

All images go in the `images/` folder.

### Scale Models
| File | Purpose | Notes |
|------|---------|-------|
| `CODE.png` | No-background hero image | Shown next to model title on model page |
| `CODE_1.jpg` | First gallery photo | Shown in gallery section |
| `CODE_2.jpg` | Second gallery photo | etc. |
| `CODE_3.jpg` | Third gallery photo | Unlimited numbered photos |

`CODE` = the Code column value from your CSV (e.g. `400GTMonza-1`, `AveLP700-1`).

### Category Preview Images (homepage cards)
| File | Category |
|------|----------|
| `preview-production.png` | Production Models |
| `preview-concepts.png` | Concepts & Prototypes |
| `preview-oneoffs.png` | Few-Offs & One-Offs |
| `preview-racing.png` | Race Cars |
| `preview-trattori.png` | Lamborghini Trattori |
| `preview-motorcycles.png` | Lamborghini Motorcycles |
| `preview-related.png` | Related Cars |

### Family Preview Images (collection page family cards)
Name: `preview-FAMILYSLUG.png`
Where FAMILYSLUG = lowercase family name, spaces → hyphens, accents stripped.
Examples: `preview-aventador.png`, `preview-350-gt.png`, `preview-huracan.png`

### Memorabilia Images
Single image: `memo-SLUG.jpg`
Multiple images: `memo-SLUG_1.jpg`, `memo-SLUG_2.jpg` etc.
SLUG = item name, lowercase, spaces → hyphens. e.g. "Tonino Lamborghini Watch" → `memo-tonino-lamborghini-watch.jpg`

### Blog Post Images
Preview image (shown on blog listing + homepage): `blog-POSTID.png` or `.jpg`
POSTID = the `id` field in blog-data.js. e.g. post id `santagata-2024` → `blog-santagata-2024.png`

### Other
| File | Purpose |
|------|---------|
| `lamborghini-wall.jpg` | Wall photo shown on homepage |
| `lambomodels-logo.png` | Full logo (hero + footer) |
| `lambomodels-logo-clean.png` | Text-only logo (nav bar) — falls back to full logo if missing |
| `instagram.png` | Social icon (18×18px) |
| `x.png` | Social icon |
| `facebook.png` | Social icon |
| `linkedin.png` | Social icon |
| `email.png` | Email icon |

---

## CSV: collection.csv

Columns (in order):
```
Car Year | Brand | Model | Scale | Color | Maker | Year | Code | Price | Notes
```

| Column | Description |
|--------|-------------|
| Car Year | Real car's production/release year (e.g. `1966`, `2023`) |
| Brand | Always `Lamborghini` for Lambo cars, `Lamborghini Trattori` for tractors, `Ducati` for bikes |
| Model | Model name only, no brand prefix (e.g. `Aventador LP700-4`) |
| Scale | e.g. `1:43`, `1:18`, `1:12` |
| Color | e.g. `Yellow`, `Metallic Blue`, `Copper` |
| Maker | Scale model maker (e.g. `Bburago`, `Maisto`, `Looksmart`) |
| Year | Year YOU added it to the collection |
| Code | Unique identifier — drives image naming (e.g. `AveLP700-1`) |
| Price | e.g. `$30.0` or `~$50` |
| Notes | Optional. Add `(Related)` here to mark a car as a Related Car (strips Lamborghini prefix) |

### Car Year Overrides (in js/data.js)
Some car years are overridden in code. Find the `// ── CARYEAR OVERRIDES ──` block in `js/data.js`:
```js
// Urus: force 2017 (production launch) instead of 2012 (concept year in CSV)
if ((row['Model']||'').toLowerCase().includes('urus') && carYear === '2012') carYear = '2017';
```
To revert: comment out or change the value.

---

## CSV: memorabilia.csv

Columns:
```
Lamborghini Brand | Memorabilia type | Price
```

| Column | Description |
|--------|-------------|
| Lamborghini Brand | Category grouping (e.g. `Automobili Lamborghini`, `Tonino Lamborghini`) |
| Memorabilia type | Item name — drives image slug |
| Price | Optional price |

---

## descriptions.json

Located at `data/descriptions.json`. Key = model Code from CSV.

```json
{
  "CODE": {
    "short":       "1-3 sentence description shown above specs on model page",
    "long":        "Longer text shown after gallery. Use \\n for paragraph breaks.",
    "funny":       true,
    "showNote":    true,
    "autographed": true,
    "special":     true,
    "concept":     true,
    "oneoff":      true,
    "fewoff":      true,
    "milestone":   "1st"
  }
}
```

**All fields are optional.** Only include what you need.

---

## All Available Tags

Set in `descriptions.json` per model Code.

### Info Tags (gray, clickable → filters search)
| Field | Tag shown | Use case |
|-------|-----------|----------|
| `"funny": true` | Funny Lambo | Bootleg / novelty / weird models |
| `"concept": true` | Concept | Model that's a concept within a production family (e.g. Urus Concept) |
| `"oneoff": true` | One-Off | One-of-a-kind model within a family |
| `"fewoff": true` | Few-Off | Very limited bespoke edition |
| `"showNote": true` | *(shows Notes field as badge)* | When Notes has useful public-facing info |

### Special Tags (colored, clickable)
| Field | Tag shown | Style |
|-------|-----------|-------|
| `"autographed": true` | ✍ Autographed | Gold glow |
| `"special": true` | ★ Special | Purple glow |

### Milestone Tags (animated glow, clickable)
| Value | Tag shown | Style |
|-------|-----------|-------|
| `"milestone": "1st"` | 🥇 1st Model | Gold glow animation |
| `"milestone": "2nd"` | 🥈 2nd Model | Silver glow animation |
| `"milestone": "3rd"` | 🥉 3rd Model | Bronze glow animation |
| `"milestone": "100th"` | 💯 100th Model | Teal glow |
| `"milestone": "200th"` | ⭐ 200th Model | Blue glow |
| `"milestone": "300th"` | 🔥 300th Model | Red/pink glow |
| `"milestone": "400th"` | 👑 400th Model | Purple glow |

A model can have multiple tags — just set multiple fields to `true`.

---

## site-config.json

Located at `data/site-config.json`.

```json
{
  "latestAddition": "DucatiSF-1",
  "collectionMilestones": [...]
}
```

| Field | Description |
|-------|-------------|
| `latestAddition` | Code of the model shown in the "Latest Addition" card on the homepage |

Change `latestAddition` to whatever Code you want whenever you add a new model.

---

## Production Family Sort Order

The order of families within Production Models on the collection page is controlled by `PROD_FAM_ORDER` in `js/data.js` (around line 290):

```js
const PROD_FAM_ORDER = [
  '350 GT','400 GT','Miura','Espada','Faena','Islero','Jarama',
  'Countach','Urraco','Silhouette','Jalpa','LM002','Diablo','Murciélago',
  'Gallardo','Aventador','Huracán','Urus','Revuelto','Temerario',
];
```

To reorder: just move names around in this array. Any family not in this list gets sorted by carYear and appended after.

---

## Family Descriptions

Shown on the family group page (e.g. all Aventadors) above the model grid.
Located in `js/data.js` in the `LM.FAMILY_DESC` object (around line 380).

```js
LM.FAMILY_DESC = {
  'Aventador': 'The Aventador arrived in 2011...',
  'Huracán':   'The Huracán replaced the Gallardo...',
  // etc.
};
```

Key = exact family name as it appears on the site (e.g. `'Aventador'`, `'350 GT'`, `'Murciélago'`).

---

## Blog Posts

Edit `js/blog-data.js`. Add new posts to the TOP of the array (newest first).

```js
{
  id:      'my-post-id',       // URL slug, also drives preview image name
  date:    'January 2025',
  title:   'Post Title',
  emoji:   '🏆',              // shown if no preview image
  excerpt: 'Short summary...',
  blocks: [                   // rich content blocks (see below)
    { type: 'text',    text: 'Paragraph text.' },
    { type: 'heading', text: 'Section Title' },
    { type: 'image',   src: 'images/photo.jpg', caption: 'Optional' },
    { type: 'images',  srcs: ['img1.jpg','img2.jpg'], caption: 'Optional' },
    { type: 'quote',   text: 'Pull quote text.', author: 'Optional' },
    { type: 'divider' },
  ],
  // OR use plain content string (old format, still works):
  content: 'Paragraph one.\n\nParagraph two.',
}
```

Preview image: add `images/blog-POSTID.png` (or `.jpg`) — loads automatically.

---

## Admin-Only Features

### Print Catalogue
Hidden by default. To access: visit `collection.html?admin=1` — the 🖨 Catalogue button appears and stays visible for your session (stored in browser localStorage).

To reset: open browser DevTools → Application tab → Local Storage → delete `lm_admin`.

### Compare Tool
Public. Visit `compare.html` or use the ⚖ Compare button on the collection page.
Search supports multi-word queries: `aventador bburago`, `red maisto 1:43`, etc.

---

## Category Detection

How the site decides which category each model belongs to:

| Category | How detected |
|----------|-------------|
| Trattori | Brand contains `trattori` OR model contains `tractor`/`traktor` |
| Motorcycles | Brand/model contains `ducati` or `streetfighter` |
| Related | Notes contains `(Related)` OR brand isn't Lamborghini OR brand is `marini`/`oleodinamica`/`latinoamerica` |
| Production | Model name starts with a known production family name |
| One-Offs | Model name contains: veneno, centenario, sesto elemento, sc18, sc20, sián, invencible, autentica, essenza, reventón |
| Concepts | Model name contains: egoista, terzo millennio, marzal, bravo, etc. |
| Racing | Model name contains: konrad wsc, sc63, lc89, lc90, lambo 291, formula 1 |

---

## URL Parameters

| URL | Effect |
|-----|--------|
| `collection.html?admin=1` | Reveals the Catalogue button (persists via localStorage) |
| `compare.html?id=CODE` | Pre-fills first slot with that model |
| `model-group.html?cat=production&fam=Aventador` | Opens a specific family group |
| `model.html?id=CODE` | Opens a specific model |
| `search.html?q=QUERY` | Pre-fills search with query |
| `blog-post.html?id=POST-ID` | Opens a specific blog post |

---

## Color System

The color tag on each model card is tinted with the actual color. Colors are auto-detected from the Color field in your CSV. Supported colors include:

yellow, gold, orange, red, green, blue, white, black, silver, grey/gray, metallic, copper, purple, brown, pink, beige/tan, cream, bronze, champagne, turquoise, lime, cyan, maroon, navy, teal, pearl, anthracite.

Any color containing one of these keywords gets auto-colored. `Metallic Blue` → blue tint. `Dark Green Pearl` → green tint.

---

## SEO

- `sitemap.xml` is in the root. Submit it to Google Search Console at `https://search.google.com/search-console` after deploying to lambomodels.com.
- `robots.txt` allows all crawlers and points to the sitemap.
- Each page has Open Graph and Twitter Card meta tags for social sharing previews.

---

## Contact

Email: lambomodels@gmail.com

---

*Last updated: May 2026*

---

## Model Page — Rich Content (Article Style)

For special models, you can add a full article-style page with images, quotes, and sections — the same format as blog posts. Add a `blocks` array to the entry in `descriptions.json`:

```json
"JarSVR-1": {
  "short": "One of the most special Lamborghinis in my collection.",
  "long": "The Jarama SVR is a unique factory special...",
  "blocks": [
    { "type": "heading", "text": "The Story Behind This Model" },
    { "type": "text",    "text": "I got this model in 2020..." },
    { "type": "image",   "src": "images/JarSVR-1_story1.jpg", "caption": "At the Museo" },
    { "type": "images",  "srcs": ["images/JarSVR-1_a.jpg", "images/JarSVR-1_b.jpg"], "caption": "Details" },
    { "type": "quote",   "text": "The only true 1/43 Islero S.", "author": "LAMBOMODELS" },
    { "type": "divider" },
    { "type": "link",    "href": "https://example.com", "text": "External article" }
  ],
  "autographed": true,
  "special": true,
  "oneoff": true
}
```

**Block types:**
| Type | Fields | Notes |
|------|--------|-------|
| `text` | `text` | Paragraph. Supports HTML: `<a href="...">link</a>`, `<strong>bold</strong>`, `<em>italic</em>` |
| `heading` | `text` | Section heading |
| `image` | `src`, `caption` (optional) | Full-width image, click to lightbox |
| `images` | `srcs` (array), `caption` (optional) | Responsive grid, click to lightbox |
| `quote` | `text`, `author` (optional) | Pull quote with yellow accent |
| `divider` | — | Horizontal rule |
| `link` | `href`, `text` | External link as a paragraph |

If you have both `long` and `blocks`, the `blocks` array takes priority and `long` is ignored on the model page.

If neither `short` nor `long`/`blocks` is set, **nothing shows** — no placeholder, no empty section. Clean.

### Hyperlinks in text fields
Use standard HTML anchor tags inside any `text` or `long` field:
```json
"long": "You can read more about this car at <a href='https://example.com' target='_blank'>this article</a>."
```

---

## Image Tool (image_tool.py)

Located at the root of the project. Requires ImageMagick and Python tkinter.

**Install dependencies (Ubuntu):**
```bash
sudo apt install imagemagick python3-tk
```

**Run:**
```bash
python3 image_tool.py
```

### Tab 1 — Gallery Photos
Compresses, renames, and watermarks a folder of photos.

1. **Source folder** — folder containing your raw/phone photos
2. **Output folder** — where processed files are saved (e.g. `images/`)
3. **Model code** — the Code from your CSV (e.g. `JarSVR-1`)
4. **JPEG quality** — 87 recommended (good quality, ~250-300KB)
5. **Max dimension** — 1400px recommended
6. **Watermark PNG** — place `watermark.png` in the same folder as the script (the clean white LAMBOMODELS logo works well)
7. **Watermark position** — Bottom Right recommended
8. **Watermark opacity** — 55% is subtle but visible

Output files: `JarSVR-1_1.jpg`, `JarSVR-1_2.jpg`, etc.

If `watermark.png` is missing, images are processed without watermark.

### Tab 2 — No-BG Image
For the transparent-background hero image shown on collection cards and next to the model title.

1. Place your no-bg PNG in a folder
2. Select that folder as source
3. Enter the model code
4. Click Process — saves as `CODE.png`

No watermark is applied to no-bg images (they sit on a dark background anyway).

---

## Google / SEO — URL format

Google indexes by content, not by URL structure. `model.html?id=JarSVR-1` is perfectly fine for indexing — Google follows query parameters and indexes the page content. Your old site used clean URLs (`/1969-lamborghini-islero-s`) which are slightly prettier but have zero SEO advantage for a personal collection site. The content and meta tags matter far more.

To make the site indexable:
1. Deploy to `lambomodels.com`
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Add your property
4. Submit `https://www.lambomodels.com/sitemap.xml`
5. Google will crawl and index within days to weeks


---

## Search — Field Filters

The search page has filter chips across the top. Click one to restrict search to that field only.

| Chip | What it searches |
|------|-----------------|
| All Fields | Everything (default) |
| Model Name | Full model name |
| Color | Color field |
| Scale | Scale field (e.g. 1:43) |
| Maker | Scale model manufacturer |
| Car Year | Real car's year |
| Year Added | Year you added it to the collection |
| Category | production, concepts, oneoffs, racing, trattori, motorcycles, related |
| Code | CSV code |

Clicking a tag on a model page (e.g. "Year Added: 2025") pre-selects the correct filter chip automatically.

---

## Memorabilia Descriptions

Add to `js/memorabilia-data.js` at the bottom in the `MEMO_DESCRIPTIONS` object.

Key = item name slugified: lowercase, spaces→hyphens, special chars removed.
e.g. "Tonino Lamborghini Watch" → `"tonino-lamborghini-watch"`

```js
window.MEMO_DESCRIPTIONS = {
  "tonino-lamborghini-watch": {
    "short": "A beautiful automatic watch from the Tonino Lamborghini brand.",
    "long": "Acquired in 2023 at the Museo Ferruccio Lamborghini...\n\nSecond paragraph here."
  },
};
```

Fields: `short` (shown above price on the item page), `long` (shown below gallery).
HTML links work in both fields: `<a href="url">text</a>`.
