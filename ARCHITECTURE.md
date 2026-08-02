# Architecture

## Pattern Overview

**Overall:** Single-file IIFE module (`highlight-tool.js`) with a popup-window control UI. The bookmarklet runs in the host page's context; the control panel lives in a child popup window (`openPopup()`); the page (opener) stays the source of truth for all state. Activating the bookmark again tears the previous session down via `window._HL.cleanup()` and opens a fresh popup.

**Key Characteristics:**
- One source file, vanilla JavaScript, no framework, no build step for end users — the shipped artifact is the minified bookmarklet
- CSP-safe by construction: no inline `onclick`/`onchange` anywhere — popup controls are wired with `addEventListener` from the opener's (already-allowed) script context, per-highlight controls use one delegated listener on `#hl-list` reading `data-*` attributes, and icons are inline SVGs (no external fonts or stylesheets)
- All state lives in the closure's `state` object; the popup is rebuilt from it on every change (`renderPopup()`), so the popup is always a disposable view
- Highlights are `position:fixed` overlays at pick-time viewport coordinates; each highlight stores the page's scroll position at pick time so captures can convert to absolute page coordinates
- Screenshot rendering is delegated to html2canvas, loaded on demand from a CDN (`takeScreenshot()`)

## Layers

**State (closure):**
- Purpose: Holds the single source of truth for the whole tool
- Location: `highlight-tool.js` (top of IIFE)
- Contains: `state` object — `highlights[]`, `nextId`, `picking`, `screenshotMode` (`viewport`/`fullpage`/`highlights`), `dprScale`, `captureDirty`; plus module-level `popup`, `lastBlob`
- Depends on: nothing
- Used by: every other layer; reachable for inspection via `window._HL.state`

**Popup UI:**
- Purpose: The control panel (New/Clear buttons, per-highlight editors, screenshot settings, preview)
- Location: `openPopup()` (inline HTML + CSS string written into the popup document), `wirePopupControls()`, `renderPopup()`, `updateToolbar()`, `syncScMode()`, `gridOptions()`
- Contains: One inline-HTML build of the popup; the header row carries the inline-SVG brand mark and the `VERSION` string; delegated click/change handlers on `#hl-list` (`onHlListClick`, `onHlListChange`) that dispatch on `data-hl` attributes; a delegated `wheel` handler (`onPopupWheel`) for mouse-wheel fine-tuning on focused number inputs
- Depends on: state, `icon()`, `htmlEncode()`
- Used by: entry point at startup; re-rendered after every state mutation

**Element picking:**
- Purpose: Let the user click any element on the page to add a highlight
- Location: `enablePick()`, `disablePick()`, `togglePick()`
- Contains: A full-page transparent `pickerOverlay` (z-index 99998) with crosshair cursor; a `hoverOverlay` (z-index 99997) previewing the hovered element's box; `getTarget()` flips overlay `pointer-events` off, reads `document.elementFromPoint()`, flips it back; Esc-key handler cancels picking
- Depends on: state, `getDefaultHighlight()`
- Used by: popup's New/Cancel button; Esc key

**Overlay rendering:**
- Purpose: Draw one `.hl-overlay` div per highlight on the page (border, background, badge, label)
- Location: `renderHighlights()`, `getBadgeStyle()`, `getLabelStyle()`, `gridPosCSS()`
- Contains: Removes all `.hl-overlay` divs and rebuilds them; computes final box from `rect + padding + margin`; per-highlight z-index from `h.badge.z`; badge/label anchored to one of nine grid positions
- Depends on: state
- Used by: every state mutation (pick, update, remove, move, clear)

**Coordinate conversion:**
- Purpose: Bridge pick-time fixed viewport coords and capture-time absolute page coords
- Location: `convertHighlightsToAbsolute()`, `convertHighlightsToFixed()`
- Contains: Iterates `.hl-overlay` divs and adds/subtracts each highlight's stored `rect.scrollX`/`rect.scrollY`, toggling `position` between `fixed` and `absolute`
- Depends on: state
- Used by: `doCapture()` for `fullpage` and `highlights` modes (convert before capture, restore after)

**Capture:**
- Purpose: Produce the screenshot PNG in the selected mode and surface it for preview/download
- Location: `capture()`, `takeScreenshot()`, `doCapture()`, `cropToHighlights()`
- Contains: On-demand html2canvas loader (removes any stale injected script so retries actually reload, distinguishes CSP-blocked from offline in the error message); per-mode capture (`captureViewport`, `captureFullPage` — html2canvas over `documentElement` sized to `body`/`docEl` scroll extents); `cropToHighlights()` draws the highlights' bounding box (plus padding) from the full-page canvas onto a new canvas at DPI scale
- Depends on: state, coordinate conversion, external html2canvas (CDN)
- Used by: popup's Capture button

**Download:**
- Purpose: Save the last captured blob as a PNG
- Location: `download()`
- Contains: Creates a temporary `<a>` with an object URL (`highlight-<timestamp>.png`), clicks it, revokes the URL
- Depends on: `lastBlob`
- Used by: popup's Download button (disabled until a fresh capture exists)

**Public API facade:**
- Purpose: Expose the tool to the page and to re-activation; expose pure functions to the test suite
- Location: `window._HL` (bottom of IIFE), `__test` sub-object
- Contains: `state`, lifecycle (`enablePick`, `disablePick`, `clearAll`, `cleanup`), picking toggle (`togglePick`), highlight ops (`getHighlights`, `updateHL`, `removeHL`, `moveHL`), coordinate conversion (`convertHighlightsToAbsolute`, `convertHighlightsToFixed`), capture (`takeScreenshot`, `capture`, `download`), rendering (`renderPopup`, `updateToolbar`; `renderHighlights` is not exposed), and `__test` with the pure functions `htmlEncode`, `gridPosCSS`, `getDefaultHighlight`, `seed`
- Depends on: all layers
- Used by: bookmark re-activation (`window._HL.cleanup()`), the demo page (`docs/index.html`), the test suite

## Data Flow

**Pick flow:**
1. User clicks New — `togglePick()` → `enablePick()` — `highlight-tool.js`
2. Overlay `mousemove` shows `hoverOverlay` on the hovered element; `click` reads `document.elementFromPoint()` — `highlight-tool.js`
3. `getDefaultHighlight(rect)` builds the model (next id, palette colour, defaults, scroll position captured) — `highlight-tool.js`
4. Highlight pushed to `state.highlights`; `renderHighlights()` + `renderPopup()` redraw page overlays and the popup list — `highlight-tool.js`

**Edit flow:**
1. Popup input/select changes — delegated `onHlListChange` reads `data-hl`/`data-id`/`data-sec`/`data-key`/`data-sub` — `highlight-tool.js`
2. `updateHL(id, section, key[, subKey], value)` — 4 args set `section[key]`, 5 args set `section[key][subKey]` — `highlight-tool.js`
3. `state.captureDirty = true`; `renderHighlights()` + `renderPopup()` re-render both views — `highlight-tool.js`

**Reorder / delete flow:**
1. Popup arrow/trash button click — delegated `onHlListClick` dispatches on `data-hl="move"`/`"remove"` — `highlight-tool.js`
2. `moveHL(id, dir)` swaps array elements; `removeHL(id)` splices — `highlight-tool.js`
3. `renumberBadges()` makes `badge.number` equal array position (contiguous after add/remove/move) — `highlight-tool.js`
4. Both views re-rendered; capture marked dirty — `highlight-tool.js`

**Capture flow:**
1. Capture button — `capture()` shows "Capturing..." then `takeScreenshot()` — `highlight-tool.js`
2. If `window.html2canvas` is missing, inject the jsdelivr script (removing any stale tag first); on error, show the CSP/offline message in the preview — `highlight-tool.js`
3. `doCapture(mode, scale)` — for `fullpage`/`highlights`, `convertHighlightsToAbsolute()` first; html2canvas captures; overlays converted back to fixed — `highlight-tool.js`
4. `done(canvas)` — `canvas.toBlob()` → `lastBlob`; preview shows the blob via object URL; `captureDirty = false`; Download enabled — `highlight-tool.js`
5. Download button — `download()` creates an object-URL `<a download="highlight-….png">` and clicks it — `highlight-tool.js`

**Cleanup flow (bookmark re-activation):**
1. IIFE start: `if (window._HL) window._HL.cleanup()` — `highlight-tool.js`
2. `cleanup()` — `clearAll()`, `disablePick()`, close popup, revoke `lastBlob` URL, `delete window._HL` — `highlight-tool.js`
3. A fresh `openPopup()` runs — `highlight-tool.js`

## Key Abstractions

**Highlight model:**
- Purpose: One plain object per highlighted element; everything the overlays, popup editors and capture crop read
- Location: `getDefaultHighlight()` in `highlight-tool.js`
- Shape: `id`, `rect { top, left, width, height, scrollX, scrollY }`, `padding { top, right, bottom, left }`, `margin { x, y }`, `border { color, width, style }`, `background { color, opacity }`, `badge { visible, number, z, grid, size, margin { x, y }, color, textColor }`, `label { visible, text, grid, fontSize, margin { x, y }, color }`
- Pattern: Immutable-by-convention — mutations go through `updateHL`/`removeHL`/`moveHL`; `getHighlights()` returns a shallow copy

**`data-hl` control protocol:**
- Purpose: Route popup interactions to highlight operations without inline handlers (CSP-safe)
- Location: `renderPopup()` markup + `onHlListClick()`/`onHlListChange()` in `highlight-tool.js`
- Attributes: `data-hl` (`update`/`move`/`remove`), `data-id`, `data-sec` (section), `data-key`, `data-sub` (nested key), `data-dir` (±1 for move), `data-int` (parse value as integer)

**Grid positioning:**
- Purpose: Anchor badge/label to one of nine cells with pixel offsets
- Location: `GRIDS` array, `gridPosCSS()`, `gridOptions()` in `highlight-tool.js`
- Pattern: `gridPosCSS` returns plain CSS `top/left/right/bottom` + `transform: translate(calc(...))` strings; a 4px base inset (function `p(v)`) plus the user's `margin.x`/`margin.y`; unknown grid falls back to centred

**Inline icon set:**
- Purpose: Buttons without external font or stylesheet, so they render under any CSP and offline
- Location: `ICONS` map + `icon()` in `highlight-tool.js`
- Pattern: Phosphor icon path data (MIT) embedded as SVG `<path>` strings; `icon(name)` wraps them in an `aria-hidden` `<svg viewBox="0 0 256 256">`

**Palette:**
- Purpose: Auto-cycle highlight colours by id
- Location: `PALETTE` in `highlight-tool.js`
- Pattern: 10-entry array indexed by `(nextId - 1) % 10`; the colour seeds `border.color`, `background.color`, `badge.color`

**`window._HL` facade + `__test`:**
- Purpose: Public surface for re-activation, the demo page, and the unit tests
- Location: bottom of `highlight-tool.js`
- Pattern: `__test` exposes only pure functions (`htmlEncode`, `gridPosCSS`, `getDefaultHighlight`) plus a `seed()` injection hook; tests `eval` the source under browser stubs

## Entry Points

**Bookmark activation:**
- Location: top and bottom of `highlight-tool.js` (IIFE)
- Triggers: User clicks the bookmark on any page
- Responsibilities: Tear down any previous session via `window._HL.cleanup()`, then `openPopup()` and wire controls

**`window._HL` methods:**
- Location: `highlight-tool.js`
- Triggers: Re-activation, the demo page's "Try the tool" (`docs/index.html` injects `highlight-tool.min.js`), test code
- Responsibilities: Lifecycle, highlight ops, capture/download, rendering; used by the page rather than `openPopup()` when embedding

**Test suite:**
- Location: `test/core.test.js`, invoked by `npm test` (`node --test test/core.test.js`)
- Triggers: Local dev, CI (`npm test` in `.github/workflows/ci.yml`)
- Responsibilities: Stub `window`/`document`/`alert`, `eval` the source, and assert the pure functions plus highlight ops (`updateHL`, `removeHL`, `moveHL`, badge contiguity)

**Demo page:**
- Location: `docs/index.html`
- Triggers: "Try the tool" button click
- Responsibilities: Inject `docs/highlight-tool.min.js` via a `<script>` tag; the tool then boots on the demo page itself

## Error Handling

**Strategy:** Fail visible, never silently. Every failure path writes a message into the popup's preview area or blocks the action.

- Popup blocked → `alert('Popup blocked! ...')` and abort (`openPopup()`)
- html2canvas CDN load fails → red message in the preview distinguishing "blocked by this page's security policy" from "offline" (`takeScreenshot()`'s `onerror`)
- Capture rejects → red "Capture failed: <message>" in the preview (`captureError` in `doCapture()`)
- Retry after a failed html2canvas load → the stale injected `<script>` is removed so a retry actually reloads the CDN file (`takeScreenshot()`)
- "Areas" mode with zero highlights → option disabled and mode falls back to `viewport` (`syncScMode()`)
- Download before a fresh capture → Download button disabled while `captureDirty || !lastBlob` (`updateToolbar()`)
- Esc during picking → `preventDefault()` and `disablePick()` (survives page-level Esc bindings)

## Cross-Cutting Concerns

**Logging:** None — no logging facility; user-visible errors surface in the popup preview.

**Caching:** None persistent — `lastBlob` is the only retained artifact and its object URL is revoked on cleanup or replacement.

**Storage:** None — all state lives in the IIFE closure for the session; reloading or re-activating the bookmark starts fresh. `htmlEncode()` escapes every user-supplied string before it is interpolated into popup HTML.

**CSP-safety:** Use `addEventListener` from the opener's script context instead of inline handlers; use one delegated listener on `#hl-list` with `data-*` attributes instead of per-row inline `onclick`; use inline SVG path icons instead of fonts/webfonts. Popup and demo pages inherit the host page's CSP, so these constraints hold everywhere.

**Scroll-aware coordinates:** Store `scrollX`/`scrollY` in each highlight at pick time; convert overlays to absolute page coordinates for full-page and areas capture, then restore fixed coordinates after the capture so live overlays stay pinned to the viewport.

**Version sync:** The popup header shows `VERSION` from `highlight-tool.js`; the build (`npm run build` in `package.json`) fails if it does not match `package.json`'s `version`.
