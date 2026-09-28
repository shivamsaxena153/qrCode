# QR Studio

A browser-only QR code generator for text, URLs, and email recipients. QR codes are created locally; content is not sent to a server.

## Features

- Live QR preview with L/M/Q/H error correction
- URL normalization and `mailto:` email QR codes
- PNG export with optional transparent background, or JPEG with a white background
- 1024 × 1024 pixel downloads

Scanning an email QR asks a compatible scanner to open a draft in the device's configured email app. The result depends on the scanner and device configuration.

## Run locally

Install [Bun](https://bun.sh/), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Run the tests and create a production build with:

```sh
bun run test
bun run build
```

The production files are written to `dist/`.

## Deploy to GitHub Pages

The GitHub Actions workflow runs tests and builds pull requests. It deploys pushes to `main` to GitHub Pages.

1. Push this project to a GitHub repository on the `main` branch.
2. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main` or run the **Checks and Pages** workflow manually.

Vite uses relative asset paths so the build works when hosted beneath a GitHub repository path.