#!/usr/bin/env bash
# Re-encode portrait + og-image from a master source.
# Requires: sips (macOS native), avifenc, cwebp (brew install libavif webp).
# Usage: bash scripts/build-images.sh path/to/source.jpg
set -euo pipefail

SOURCE="${1:-}"
if [[ -z "$SOURCE" || ! -f "$SOURCE" ]]; then
  echo "Usage: bash scripts/build-images.sh path/to/source.jpg"
  echo "Source must be at least 1600x1200, landscape orientation."
  exit 1
fi

cd "$(dirname "$0")/.."

# Step 1: crop master 4:5 portrait frame (800x1000), subject horizontally centered.
# Source is 1600x1200 landscape. Subject's face sits ~x=880 in source.
# crop_x_start = 880 - 400 = 480 (centers his face in the 800-wide window).
# crop_y_start = 80 (slight headroom; bottom lands at y=1080, keeping the thumb in frame).
sips -c 1000 800 --cropOffset 80 480 "$SOURCE" --out /tmp/portrait-master.jpg > /dev/null

# Step 2: generate 3 sizes for srcset
for w in 400 600 800; do
  h=$((w * 5 / 4))
  sips -z $h $w /tmp/portrait-master.jpg --out /tmp/p-${w}.jpg > /dev/null
done

# Step 3: encode AVIF (best compression) + WebP (broader support) + JPEG (fallback)
for w in 400 600 800; do
  avifenc -q 60 --speed 4 -y 420 /tmp/p-${w}.jpg assets/portrait-${w}.avif > /dev/null 2>&1
  cwebp -q 78 -m 6 /tmp/p-${w}.jpg -o assets/portrait-${w}.webp > /dev/null 2>&1
done
sips -s format jpeg -s formatOptions 60 /tmp/p-800.jpg --out assets/aromal-portrait.jpg > /dev/null

# Step 4: og-image (1200x630 social card) — landscape crop, subject left-of-center
# so social previews show his face + leave room for site title overlay if added later.
sips -c 630 1200 --cropOffset 250 280 "$SOURCE" --out /tmp/og.jpg > /dev/null
sips -s format jpeg -s formatOptions 65 /tmp/og.jpg --out assets/og-image.jpg > /dev/null

# Step 5: favicons + PWA icons (from master, square-cropped at face level)
sips -z 512 512 -c 512 512 /tmp/portrait-master.jpg --out assets/icon-512.png > /dev/null
sips -z 192 192 assets/icon-512.png --out assets/icon-192.png > /dev/null
sips -z 180 180 assets/icon-512.png --out assets/apple-touch-icon.png > /dev/null
sips -z 32 32 assets/icon-512.png --out assets/favicon-32.png > /dev/null
sips -z 16 16 assets/icon-512.png --out assets/favicon-16.png > /dev/null

# Step 6: optimize PNGs if pngquant available
if command -v pngquant >/dev/null; then
  pngquant --skip-if-larger --strip --speed 1 --quality 70-85 \
    --ext .png --force assets/icon-512.png assets/icon-192.png assets/apple-touch-icon.png 2>/dev/null || true
fi

echo "Images rebuilt:"
ls -la assets/portrait-*.{avif,webp,jpg} assets/aromal-portrait.jpg assets/og-image.jpg assets/icon-*.png assets/apple-touch-icon.png 2>/dev/null | awk '{printf "  %8s  %s\n", $5, $NF}'
