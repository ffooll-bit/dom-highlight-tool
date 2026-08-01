# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.

Report vulnerabilities privately through the **Security Advisories** feature on GitHub: open the repository page and use the **Report a vulnerability** button (or create an advisory under the *Security* tab).

When reporting, include:

- The version or commit the issue affects
- Steps to reproduce
- The impact you observed
- A suggested fix, if you have one

Reports are acknowledged within a few days and kept private until a fix is released.

## Supported versions

Only the latest release on `main` is supported. Security fixes land in a release and are announced via the release notes.

## Security considerations for a bookmarklet

A bookmarklet runs with the full privileges of the page it is activated on. This is inherent to how bookmarklets work:

- Only install the bookmark on sites you trust.
- The tool loads [html2canvas](https://html2canvas.hertzen.com/) from a CDN when you capture a screenshot — an internet connection is required, and the script is fetched from a third-party host.
- Everything stays in the browser: no data is sent to any server. Highlights, labels and captured screenshots never leave the page.
- The tool creates a control popup window and transparent overlay elements on the page you activate it on; it does not read or transmit page content.
