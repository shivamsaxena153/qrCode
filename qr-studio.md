# QR Studio — Design

## 1. Problem statement

A web app that lets anyone generate a QR code from their own input and download
it as a high-resolution image. The first release keeps the scope deliberately
narrow:

- Encode **plain text** or a **hyperlink (URL)** into a QR code.
- Preview the QR live as the user types.
- **Download** the result as **PNG** or **JPEG** at a fixed **1024×1024 px**.

Everything runs in the browser. No backend, no database, no accounts — the app
deploys as static files and generates QR codes entirely client-side.

Later releases extend this to "smart" app-open QR codes (Android intents, iOS
URL schemes) with app-store fallbacks. Those are explicitly **out of scope for
v1** and captured in §8 (Future prospects) so today's structure leaves room for
them.

---

## 2. Scope

### In scope (v1)

- Two input modes:
  - **Text** — encode an arbitrary string verbatim.
  - **URL** — encode a hyperlink, with light validation/normalization.
- Live QR preview.
- Download as **PNG** (lossless, transparent-capable) or **JPEG** (smaller,
  white background) at **1024×1024 px**.
- Choose error-correction level (L/M/Q/H) — sensible default **M**.
- Fully client-side, static deployment.

### Out of scope (v1)

- Short links, link editing, analytics (would need a backend + store).
- Android intent / iOS scheme builders and store fallback (see §8).
- Logo embedding, gradient/branded QR styling.
- Batch generation.

---

## 3. Why client-side only

QR generation is pure computation over the input string — no server needed. A
client-side app means:

- **Instant** preview with no network round-trip.
- **Private** — the encoded text/URL never leaves the browser.
- **Cheap + portable** — deploys to any static host (GitHub Pages, Netlify,
  S3 + CloudFront) with no runtime to operate.

The tradeoff (no analytics, no editable short links) is acceptable for v1 and
is where a future backend would slot in (§8).

---

## 4. QR encoding basics (what the app relies on)

- A QR code encodes a byte string. For **text** we encode the raw string; for a
  **URL** we normalize then encode the full URL.
- **Error-correction level (ECC)** trades data capacity for damage tolerance:
  - L ≈ 7%, M ≈ 15%, Q ≈ 25%, H ≈ 30% recoverable.
  - Default **M** — a good balance. H is worth choosing when a logo will later
    cover part of the code (relevant once §8 branding lands).
- The library picks the smallest QR **version** (module grid size) that fits the
  data at the chosen ECC. Longer input → denser grid.

---

## 5. Rendering & the 1024×1024 requirement

The QR is a grid of *modules* (black/white squares). To produce a crisp
1024×1024 image regardless of how many modules the content needs:

1. Generate the QR to a **canvas**, letting the library compute module count.
2. Render with **no image smoothing** (`imageSmoothingEnabled = false`) so
   modules stay hard-edged when scaled.
3. Ensure the pixel dimensions are an integer multiple of the module count
   where possible, then draw/scale the canvas to exactly **1024×1024**.
4. Keep the **quiet zone** (min 4-module white border) — required for reliable
   scanning; never crop it away.

### Format specifics

| Format | Background | Notes |
|--------|-----------|-------|
| **PNG** | transparent or white (toggle) | lossless; best for print / further editing |
| **JPEG** | always **white** (JPEG has no alpha) | smaller file; flatten transparent → white before export to avoid black fill |

Both export the same 1024×1024 canvas; only the encoder and background handling
differ. Download is triggered from the canvas via `toBlob()` /
`toDataURL(mimeType, quality)`.

---

## 6. Architecture / module breakdown

Stack: **React + Vite + TypeScript**, QR generation via the `qrcode` library
(canvas + SVG capable). No backend.

```
qr-studio/
  index.html
  package.json
  vite.config.ts
  src/
    main.tsx            # app bootstrap
    App.tsx             # layout + state wiring
    components/
      ModeTabs.tsx      # switch between Text / URL input modes
      QrInput.tsx       # text or URL field + validation
      QrPreview.tsx     # live canvas preview
      QrControls.tsx    # ECC level, background, format selector
      DownloadBar.tsx   # PNG / JPEG download buttons (1024x1024)
    lib/
      qr.ts             # wrap qrcode: input -> canvas at target size
      validate.ts       # URL normalization/validation
      download.ts       # canvas -> PNG/JPEG blob -> file download
      types.ts          # QrMode, EccLevel, ExportFormat, QrConfig
    styles/
      app.css
```

### Data model (v1)

```ts
type QrMode = "text" | "url";
type EccLevel = "L" | "M" | "Q" | "H";
type ExportFormat = "png" | "jpeg";

interface QrConfig {
  mode: QrMode;
  value: string;        // raw text or normalized URL
  ecc: EccLevel;        // default "M"
  background: "white" | "transparent"; // transparent ignored for JPEG
}
```

`lib/qr.ts` exposes one core function so future modes plug in without touching
the UI:

```ts
// Build the payload string that actually gets encoded.
// v1: text -> value; url -> normalized url.
// future: android/ios modes build a smart-link URL here (see §8).
function buildPayload(config: QrConfig): string;

// Render payload to a 1024x1024 canvas, sharp modules, quiet zone preserved.
function renderQr(payload: string, config: QrConfig, size = 1024): HTMLCanvasElement;
```

Keeping **payload construction** (`buildPayload`) separate from **rendering**
(`renderQr`) is the key extensibility seam: v2 adds new `QrMode`s that only
change how the payload string is built, not how it's drawn or downloaded.

---

## 7. User flow (v1)

```
1. Pick mode        → Text or URL
2. Type input       → live-validated (URL mode normalizes/validates)
3. Adjust options   → ECC level, background (PNG only)
4. Preview updates  → QR re-renders on every change
5. Download         → choose PNG or JPEG → 1024x1024 file saved
```

No destructive actions, no persistence — refresh clears state.

---

## 8. Future prospects

These are **not** built in v1 but the structure above is designed to absorb
them. Each is additive.

### 8.1 New QR content modes

Add to `QrMode` and implement in `buildPayload` only:

- `email` (`mailto:`), `phone` (`tel:`), `sms`, `wifi`, `vcard`, `geo`.
- No rendering/download changes required.

### 8.2 Android intent QR

Encode an Android **intent URI** that opens a specific app, with a browser
fallback baked in natively:

```
intent://<host/path>#Intent;scheme=<scheme>;package=<pkg>;
  S.browser_fallback_url=<https store or web url>;end
```

- A builder UI collects: scheme, host/path, package name, fallback URL.
- Android resolves `browser_fallback_url` automatically if the app is absent —
  no timer hack needed on Android.

### 8.3 iOS scheme / universal link QR

iOS does **not** support `intent://`. Options:

- **Custom URL scheme** (`myapp://path`) — opens the app if installed; no
  built-in fallback, so pair with the smart-link redirect (below).
- **Universal Link** (`https://…`) — cleanest open, but requires the app owner
  to host `/.well-known/apple-app-site-association`. Only viable when the user
  owns the target app.

### 8.4 Smart-link redirect + store fallback (the robust path)

Because a QR is just static data, reliable "open app, else go to store" needs a
**hosted redirect page** the QR points at:

```
QR → https://host/r.html?a=<android-intent>&i=<ios-scheme>&w=<web-fallback>
        → detect OS (user-agent)
        → try deep link
        → timer (~1.5s): if still here, redirect to app store / web fallback
```

Two ways to host it:

- **Static-only:** one generic `redirect.html` that reads targets from the query
  string. No backend. Long URLs (denser QR), targets public, no analytics.
- **Backend short links:** API stores config, returns `/go/<code>`. Short URLs,
  editable, analytics — but needs a server + data store.

`buildPayload` gains `android` / `ios` / `smartlink` modes that assemble the
redirect URL; the rendering and download pipeline is unchanged.

### 8.5 Deep-link / OS association files (only if user owns the app)

- iOS Universal Links → `/.well-known/apple-app-site-association`
- Android App Links → `/.well-known/assetlinks.json`

Out of reach for arbitrary third-party targets; documented for completeness.

### 8.6 Other likely additions

- Logo/branding in the QR center (pairs with ECC **H**).
- Color customization (with contrast guardrails for scannability).
- Batch generation from a CSV.
- Client-side history of recently generated codes.

---

## 9. Testing notes

- **v1:** unit-test `buildPayload` (text/URL normalization) and `validate.ts`;
  verify exported images are exactly 1024×1024 and that generated codes scan
  with a phone and at least one dedicated QR reader.
- **JPEG:** confirm transparent backgrounds flatten to white, not black.
- **Future smart links:** must be tested on **real devices** and inside in-app
  browsers (Instagram/Facebook/WeChat), which handle deep links inconsistently —
  emulators are not sufficient.

---

## 10. Deployment

Static build (`vite build`) → deploy `dist/` to any static host. HTTPS is
required once smart links / iOS schemes are involved (§8), so prefer an
HTTPS-by-default host from the start.
