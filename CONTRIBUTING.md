# Contributing

Thanks for taking the time to contribute to DOM Highlight Tool. This project is small on purpose — a single vanilla-JavaScript bookmarklet with no build step for end users. Keep changes in that spirit.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Make your changes in `highlight-tool.js` — this is the only source file.

## Development

- Edit `highlight-tool.js`, then regenerate the distributable files:

  ```bash
  npm run build
  ```

  This rewrites `highlight-tool.min.js` (minified via [terser](https://terser.org/)), `bookmarklet.txt` (the `javascript:` URL users copy into a bookmark) and `docs/highlight-tool.min.js` (the copy served by the live demo).
- **Always commit the regenerated artifacts.** CI runs the build and fails the job if the committed `highlight-tool.min.js` / `bookmarklet.txt` / `docs/highlight-tool.min.js` drift from the output — do not skip the build.
- Run the unit suite before opening a PR:

  ```bash
  npm test
  ```

- Test manually by copying the content of `bookmarklet.txt` into a browser bookmark and activating it on a test page (Chrome desktop is the supported target).

## Branching and pull requests

- Work on a dedicated branch off `main` (e.g. `fix/`, `feat/`, `docs/`).
- Open a pull request against `main` — the CI build must pass.
- Keep each PR focused on a single concern (one fix, one feature, one docs update).

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — a new user-facing behaviour
- `fix:` — a bug fix
- `refactor:` — code change with no behaviour change
- `chore:` / `docs:` / `ci:` — maintenance, documentation, CI

Reference the issue the commit addresses in the footer, e.g. `Fixes #12`.

## Code style

- Vanilla JavaScript only — no framework, no new dependencies.
- ES5-compatible syntax (`var`, function expressions) so the bookmarklet runs on older browsers without transpilation.
- Two-space indentation, semicolons, single-quoted strings.
- Comments only where intent is non-obvious; prefer clear names over prose.
- The popup UI is written as a single inlined HTML string inside `openPopup()` — keep it that way.

## Reporting issues

- Bugs and feature requests: [open an issue](https://github.com/ffooll-bit/dom-highlight-tool/issues) with steps to reproduce.
- Security vulnerabilities: do **not** open a public issue — see [SECURITY.md](SECURITY.md).
