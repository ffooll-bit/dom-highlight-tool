# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-08-02

### Added

- Highlights now **attach to the page**: they stay on their target elements while scrolling, and full-page and "highlighted areas" captures align exactly (no coordinate conversion needed) (#59).
- The capture preview now **fits the whole image at its original aspect ratio** — tall full-page and 2× viewport captures are no longer cropped (#70).
- The toolbar shows **"Cancel (Esc)"** while picking, and the per-highlight z-index input gains a visible **Z** label (#68).

### Changed

- `ARCHITECTURE.md` and `STRUCTURE.md` — describing the tool's layers and where to add new code — are committed to the repository (#57).
- Contributing guide points to the architecture and structure docs, `package.json` declares the live demo as its homepage, the README screenshot-mode wording is consistent and gains a **Live Demo** badge (#75).

### Fixed

- Viewport captures now show the area you are looking at, rendered at the page's layout width, and full-page captures always start from the top — the scrollbar offset, the page-top rendering and the scrolled top-margin bugs are gone (#62).
- A failed full-page or "highlighted areas" capture no longer leaves highlights offset from their targets — the coordinate-conversion layer was removed entirely (#59).
- Clearing the per-highlight z-index field can no longer sink the highlight below page content (values clamp to a minimum of 1) (#65).
- Capture error messages are HTML-escaped before being shown in the preview (#65).

## [1.1.0] - 2026-08-01

### Added

- Pressing **Escape** cancels element-picking mode (#7).
- The popup is now fully CSP-safe: controls are wired via `addEventListener` (no inline handlers), icons are inline SVGs (authentic Phosphor path data) with the brand mark in the header, and per-highlight controls use a single delegated listener (#15, #23-26, #28).
- A `node:test` unit suite covering the pure functions, run in CI (#16).
- A live demo hosted on GitHub Pages with a one-click "Try the tool" launch (#31), plus a brand favicon on the demo page (#33).
- Per-highlight **z-index control** — set which overlapping highlight renders on top (defaults follow creation order) (#50).
- **Mouse-wheel fine-tuning** on focused number inputs: hovering a focused input and scrolling adjusts its value instead of scrolling the popup (#48).
- **Version string** in the popup header, kept in sync with `package.json` by the build (#45).
- **Accessible names** (`aria-label`/`title`) on the icon-only move/delete buttons (#42).

### Changed

- Public API is self-documenting: `updateHL`'s cryptic parameters renamed, and comments added across the source (#8).
- CI fails when the committed `highlight-tool.min.js` / `bookmarklet.txt` / `docs/highlight-tool.min.js` drift from the build; `package.json` declares `node >=18`; generated files are excluded from GitHub language stats (#10).
- README refreshed: dynamic version badge, complete Files table, live-demo link, and an explicit note that capture is unavailable on pages with a strict Content-Security-Policy (#14, #32).
- Standard repository files added: `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md` and `.editorconfig` (#12).
- Section headings restyled (`.sh`): no top border, more breathing room via padding and margin (#42).

### Removed

- Dead `generateSelector` code and the unused per-highlight `selector` field (#45).

### Fixed

- Bookmark now reopens a fresh popup after the popup was closed manually, instead of only cleaning up state (#5).
- Full-page and "highlighted areas" captures no longer offset highlights when the page has been scrolled between picking and capturing (#6).
- Badge numbers stay contiguous across add, remove and move — deleting #2 of 1-2-3 and adding a new highlight now yields 1,2,3 instead of 1,2,4 (#20).
- Screenshot capture now loads html2canvas reliably: a stale failed script tag no longer poisons retries, and the failure message distinguishes a blocked page security policy from being offline (#22).
- Capture/Download buttons no longer render oversized after the icon rework (#30).
- "Highlighted Areas" capture mode no longer silently captures the full page when no highlights exist — the option is disabled and the mode falls back to Viewport (#42).

## [1.0.0] - 2026-07-30

### Added

- Initial release — a bookmarklet that highlights DOM elements and captures the result as a PNG screenshot.
- Element highlighting: click any element to add a coloured border and background.
- Customisation: border colour, width and style (solid, dashed, dotted); background colour and opacity per highlight.
- Auto-numbered circular badges with configurable position, size, colour and margin.
- Per-highlight editable labels with adjustable position, font size, colour and margin.
- Per-highlight padding and margin; reorder or delete highlights.
- Screenshot capture in three modes: viewport, full page, or highlighted areas only.
- DPI scaling (1x or 2x) for HiDPI captures, with preview before download.
- Pure vanilla JavaScript — no framework and no build step for end users; screenshot rendering via [html2canvas](https://html2canvas.hertzen.com/) (loaded from CDN); minified with [terser](https://terser.org/).

### Fixed

- Security hardening: input escaping, highlight ID collisions, script and memory leaks, scroll-coordinate accuracy, NaN input handling and unhandled promise errors.

[Unreleased]: https://github.com/ffooll-bit/dom-highlight-tool/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/ffooll-bit/dom-highlight-tool/releases/tag/v1.2.0
[1.1.0]: https://github.com/ffooll-bit/dom-highlight-tool/releases/tag/v1.1.0
[1.0.0]: https://github.com/ffooll-bit/dom-highlight-tool/releases/tag/v1.0.0
