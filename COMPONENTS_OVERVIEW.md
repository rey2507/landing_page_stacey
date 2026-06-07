# Stacey Landing Page — Components & Structure

This project uses **serverless static HTML** with **component injection** at runtime. The main HTML file (`index.html`) contains empty container elements; `assets/js/scripts.js` fetches matching HTML snippets from the `components/` folder and injects them into the containers.

---

## 1) Top-level page (`index.html`)

`index.html` defines the overall document shell and provides placeholder containers (by `id`) that are filled dynamically:

- `#navbar` → injected `components/navbar.html`
- `#hero` → injected `components/hero.html`
- `#about` → injected `components/about.html`
- `#gallery` → injected `components/gallery.html`
- `#links` → injected `components/main-links.html`
- `#footer` → injected `components/footer.html`
- `#floating-bar` → injected `components/floating-bar.html`
- `#chatBubble` / chat system: **currently removed/rolled back** (no longer loaded/included by JS)

It also includes:
- A **Lightbox** modal (static in `index.html`) for gallery image zoom:
  - `#lightbox`
  - `#lightboxImg`
  - `#closeLightbox`
- Analytics loader (GA4 `gtag`), and Tailwind CDN.
- Script entrypoint:
  - `assets/js/scripts.js`

---

## 2) Component injection system (`assets/js/scripts.js`)

### 2.1 `loadComponents()`
`loadComponents()`:
- Fetches HTML snippets from `components/*.html`
- Injects them into their matching placeholder nodes in `index.html`
- Loads the **floating bar first** (to show immediately)
- Loads the remaining components in parallel (`Promise.all`)

After injection, it initializes:
- `initNav()`
- `initGallery()`
- `initAnalytics()`

### 2.2 `initNav()`
Wires up the navigation behaviors defined in `components/navbar.html`:
- Opens mobile full-screen menu when `#menuBtn` is clicked
- Closes it when `#closeMenuBtn` is clicked
- Closes the menu when a `.mobile-nav-link` is clicked

### 2.3 `initGallery()`
Implements gallery interactivity based on elements inside `components/gallery.html`:
- Collects all `#gallery img`
- Clicking an image:
  - sets `#lightboxImg.src`
  - shows `#lightbox`
  - disables page scroll (`document.body.style.overflow = 'hidden'`)
- Closing the lightbox:
  - clicking `#closeLightbox`
  - clicking the lightbox background (but not the image)
- Zoom toggle on image click:
  - toggles `#lightboxImg.zoomed`

### 2.4 `initAnalytics()`
GA4 event wiring:
- Adds click handlers to every element with a `data-analytics` attribute
- Emits `gtag('event', 'button_click', { button_name })`
- Adds dedicated tracking for:
  - `lightbox_open`
  - `lightbox_close`
  - `lightbox_zoom` (with zoom state)

---

## 3) HTML component files (`components/`)

These snippets are fetched dynamically and injected into the page.

### 3.1 `components/navbar.html`
Navigation bar:
- Desktop logo + links (anchors to `#about`, `#gallery`, `#links`)
- Mobile menu button `#menuBtn`
- Full-screen mobile overlay menu `#mobileMenu`
- Close button `#closeMenuBtn`

Uses `data-analytics` on relevant clickable elements.

### 3.2 `components/hero.html`
Top hero/intro section:
- Welcome label (`.scroll-reveal`)
- Main heading
- CTA buttons:
  - “Explore Gallery” (to `#gallery`)
  - “My Main Links” (to `#links`)

### 3.3 `components/about.html`
About section:
- Two-column layout
- Includes a portrait image and descriptive text
- Uses `.scroll-reveal` for animation

### 3.4 `components/gallery.html`
Gallery section:
- Grid of 6 images (from `assets/images/`)
- Each image has:
  - `data-analytics="gallery_image_X"`
  - `id="gallery_image_X"`
- Images are targeted by `initGallery()` for lightbox opening

### 3.5 `components/main-links.html`
Membership/external links section:
- Exactly two primary cards:
  1. “Premium Gallery” (Fanvue link)
  2. “My Membership” (Patreon link)

Both cards include `data-analytics` attributes.

### 3.6 `components/footer.html`
Footer:
- Brand text
- Section links (anchors)
- Copyright line

### 3.7 `components/floating-bar.html`
Floating bottom CTA bar:
- Fixed positioning container `#floating-bar`
- Two links:
  - Fanvue (“Surprise Gallery!”)
  - Patreon (“My Membership”)

`assets/js/scripts.js` controls its scroll-hide/show behavior via the `.hide` class.

### 3.8 `components/chat-popup.html`
Chat popup component was **created previously** but is **rolled back/disabled**:
- `assets/js/scripts.js` no longer loads it
- The main UI placeholder for the chat flow is not active

(Per `TODO.md`, chat files were removed and functionality was rolled back.)

---

## 4) Styling files

### 4.1 `assets/css/styles.css`
Contains:
- Core typography and layout defaults
- Glassmorphism styling
- Card hover and image zoom effects
- Lightbox visibility styles and zoom transitions
- Floating bar show/hide transitions
- Scroll reveal + general visual effects
- Imports chat styles historically, but chat CSS should be removed after rollback

### 4.2 `assets/css/chat-popup.css`
Chat-specific styles.

---

## 5) Component-to-ID mapping summary

| index.html placeholder ID | Component HTML fetched | File in `components/` |
|---|---|---|
| `navbar` | `components/navbar.html` | `components/navbar.html` |
| `hero` | `components/hero.html` | `components/hero.html` |
| `about` | `components/about.html` | `components/about.html` |
| `gallery` | `components/gallery.html` | `components/gallery.html` |
| `links` | `components/main-links.html` | `components/main-links.html` |
| `footer` | `components/footer.html` | `components/footer.html` |
| `floating-bar` | `components/floating-bar.html` | `components/floating-bar.html` |

---

## 6) Runtime flow (how the page becomes visible)

1. Browser loads `index.html` shell.
2. `assets/js/scripts.js` runs on `DOMContentLoaded`.
3. `loadComponents()` fetches and injects all component HTML blocks.
4. After injection:
   - `initNav()` enables mobile menu interactions
   - `initGallery()` enables lightbox + zoom
   - `initAnalytics()` enables GA4 tracking
5. CSS handles visual effects (glass, gradients, hover lifts, lightbox transitions).

---

## 7) Key assets used by components

- Images: `assets/images/*.png` (used primarily in `hero/about/gallery`)
- Scripts: `assets/js/scripts.js`
- Styles: `assets/css/styles.css` (+ previously chat-specific styles)

