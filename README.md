<div align="center">

<h1>DOM Highlight Tool</h1>

<img src="docs/social-preview.png" alt="DOM Highlight Tool — bookmarklet for highlighting DOM elements and capturing screenshots as PNG">

A bookmarklet for **highlighting DOM elements and capturing screenshots** — click any element to annotate it, customise borders, backgrounds, numbered badges and labels, then export the result as a PNG screenshot. Just a bookmark — no extension, no backend.

[![Version](https://img.shields.io/github/v/release/ffooll-bit/dom-highlight-tool)](https://github.com/ffooll-bit/dom-highlight-tool/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/ffooll-bit/dom-highlight-tool/actions/workflows/ci.yml/badge.svg)](https://github.com/ffooll-bit/dom-highlight-tool/actions/workflows/ci.yml)
![Language](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

## Demo

<p align="center">
  <img src="docs/screenshots/screenshot-demo.png" alt="Page with multiple highlights applied — each element has a coloured border, numbered badge, and label">
  <br>
  <em>Page with active highlights</em>
</p>

<p align="center">
  <img src="docs/screenshots/screenshot-popup-1.png" alt="Tool popup showing the list of highlights with controls" width="30%">
  <img src="docs/screenshots/screenshot-popup-2.png" alt="Customisation panel — border, background, badge, and label settings" width="30%">
  <img src="docs/screenshots/screenshot-popup-3.png" alt="Capture preview with download button" width="30%">
  <br>
  <em>Tool popup (left), area customisation (centre), badge &amp; label position adjusted (right)</em>
</p>

## Features

- Click any element to add a highlight
- Customise border colour, width, style (solid / dashed / dotted)
- Background colour and opacity
- Auto-numbered circular badges (adjustable position, size, colour, margin)
- Editable labels (adjustable position, font size, colour, margin)
- Per-highlight padding and margin
- Reorder or delete highlights
- Screenshot modes: **Viewport**, **Full Page**, **Highlighted Areas Only**
- DPI scaling: 1× or 2× for HiDPI captures
- Preview before download
- Lightweight — no extension, just a bookmark

## How It Works

<div align="center">

| Layer | Technology |
|---|---|
| Core logic | Vanilla JavaScript (no framework) |
| Screenshot capture | [html2canvas](https://html2canvas.hertzen.com/) (loaded from CDN) |
| Minification & build | [terser](https://terser.org/) via npm |

</div>

A **bookmarklet** is a browser bookmark that runs JavaScript instead of navigating to a URL. The entire tool is embedded in the bookmark — nothing to install.

## Install

1. Open [`bookmarklet.txt`](./bookmarklet.txt) in your browser and copy the entire content (starts with `javascript:`)
2. Create a new bookmark in your browser:
   - **Name:** `HL` (or anything you like)
   - **URL:** paste the copied code

## Usage

Three simple phases:

### Setup
1. Open the page you want to screenshot
2. Click the bookmark — the tool popup opens

### Highlight
3. Click **New** in the popup — the cursor changes to a crosshair
4. Click any element on the page — a highlight appears with a numbered badge
5. Customise colours, padding, badge and label position in the popup
6. Repeat for more highlights (colours cycle automatically)

### Capture
7. Select screenshot mode: **Viewport** / **Full Page** / **Highlight Areas**
8. Adjust DPI scale if needed (1× or 2×)
9. Click **Capture** — the preview appears
10. Click **Download** to save the PNG

> **Note:** Click the bookmark a second time to clean up all highlights and open a fresh popup.

## Browser Support

Tested on Chrome (desktop). Other browsers may work but have not been verified. A popup blocker may need to be disabled for the site.

## Known Limitations

- Does not support iframes or Shadow DOM
- `html2canvas` is loaded from CDN — an internet connection is required
- Cross-origin content may not render in screenshots due to browser CORS policy

## Files

<div align="center">

| File | Description |
|------|-------------|
| `highlight-tool.js` | Source code (readable, commented) |
| `highlight-tool.min.js` | Minified copy (generated via `npm run build`) |
| `bookmarklet.txt` | Bookmarklet URL — copy this into a bookmark |
| `CHANGELOG.md` | Release history |
| `CONTRIBUTING.md` | Contribution guide |
| `SECURITY.md` | Security policy and reporting |
| `LICENSE` | MIT licence |
| `docs/` | Screenshots and social preview |
| `.github/workflows/ci.yml` | CI pipeline (build + artifact drift check) |
| `package.json` | Build script and project metadata |

</div>

## Development

```bash
npm install
npm run build
```

This regenerates `highlight-tool.min.js` and `bookmarklet.txt` from `highlight-tool.js` using [terser](https://terser.org/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding conventions and the pull-request workflow.

For bugs or feature requests, [open an issue](https://github.com/ffooll-bit/dom-highlight-tool/issues).

## License

[MIT License](LICENSE)
