# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Fixed

- Bookmark now reopens a fresh popup after the popup was closed manually, instead of only cleaning up state (#5).
- Full-page and "highlighted areas" captures no longer offset highlights when the page has been scrolled between picking and capturing (#6).

### Added

- Pressing **Escape** cancels element-picking mode (#7).

### Changed

- Public API is self-documenting: `updateHL`'s cryptic parameters renamed, and comments added across the source (#8).
- CI fails when the committed `highlight-tool.min.js` / `bookmarklet.txt` drift from the build; `package.json` declares `node >=18`; generated files are excluded from GitHub language stats (#10).

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
