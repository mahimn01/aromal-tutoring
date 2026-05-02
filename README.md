# aromaltutoring.com

Tutoring site for Aromal Mihraj. Brampton, ON.

Live: https://aromal-tutoring.vercel.app

## Local

    npm run dev    # http://localhost:3000

## Deploy

Push to `main`. Vercel rebuilds in ~10s.

## Editing

Copy lives in `index.html`. Update the visible text and the matching JSON-LD `@graph` near the top of `<head>` together — prices, credentials, and FAQ answers appear in both places.

Interactivity is in `app.js` — blackboard typewriter, accordions, testimonial carousel, lazy Calendly. After editing, regenerate the minified bundle:

    npm run build:js

To swap the portrait:

    npm run build:images path/to/new.jpg

Regenerates AVIF/WebP/JPEG variants and the favicon set. Adjust the `--cropOffset` values in `scripts/build-images.sh` if the subject sits differently in the new photo.

## Stack

Static HTML and vanilla JS, no framework. CSS inlined for first paint. Fonts self-hosted (Latin only). Portrait served as `<picture>` with AVIF/WebP/JPEG srcset. Calendly loads on scroll. Compression, caching, and security headers are handled by Vercel via `vercel.json`.

## Files

    index.html              page + inline CSS + JSON-LD
    app.js / app.min.js     interactivity (source / shipped)
    assets/                 portrait variants, fonts, icons, OG image
    vercel.json             headers, caching, redirects
    scripts/                build-images, build-fonts
    robots.txt sitemap.xml llms.txt 404.html manifest.webmanifest
