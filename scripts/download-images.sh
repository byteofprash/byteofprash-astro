#!/bin/bash
set -e

BASE_URL="https://byteofprash.com"
# Strip /content/images prefix — files go into public/images/YYYY/MM/filename
OUT_DIR="$(dirname "$0")/../public/images"

images=(
  "/content/images/2024/01/Screenshot-2024-01-03-at-14.12.17.png"
  "/content/images/2024/01/image-1.png"
  "/content/images/2024/01/image.png"
  "/content/images/2024/01/LT.jpg"
  "/content/images/2024/01/Pragyan.png"
  "/content/images/2024/01/VcpNet.png"
  "/content/images/2024/01/a17.jpg"
  "/content/images/2024/01/roboy.png"
  "/content/images/2024/11/DSC_0656.jpg"
  "/content/images/2024/11/DSC_1541_rickcork.jpg"
  "/content/images/2024/11/DSC_1566_BW.jpg"
  "/content/images/2024/11/DSC_5004-EFFECTS.jpg"
  "/content/images/2024/11/DSC_9624.JPG"
  "/content/images/2024/12/DSC_6388.JPG"
  "/content/images/2024/12/DSC_6421.JPG"
  "/content/images/2024/12/DSC_6507.JPG"
  "/content/images/2024/12/DSC_6662.JPG"
  "/content/images/2024/12/DSC_6835.JPG"
  "/content/images/2024/12/DSC_7067.JPG"
)

for img in "${images[@]}"; do
  # Strip the /content/images prefix from the destination path
  rel="${img#/content/images}"
  dest="$OUT_DIR$rel"
  mkdir -p "$(dirname "$dest")"
  echo "Downloading $img..."
  curl -L -o "$dest" "$BASE_URL$img"
done

echo "Done. $(echo ${#images[@]}) images downloaded to $OUT_DIR"
