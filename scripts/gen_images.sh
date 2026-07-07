#!/bin/bash
# Batch image generation for sjg project
# Generates scenic spots and poet portraits
# Usage: bash scripts/gen_images.sh
MODEL="doubao-seedream-5.0-lite"
OUTDIR="output/imagegen"
DELAY=300
log() { echo "[$(date '+%H:%M:%S')] $1"; }
for spot in \
  "华不注山:山东济南华不注山实景照片" \
  "华山:山东济南华山实景照片青山绿水"; do
    name="${spot%%:*}"
    prompt="${spot##*:}"
    log "Generating spots/$name"
    arkcli +gen --model "$MODEL" --size "2048x2048" --save-to "$OUTDIR/spots" --no-open "$prompt" 2>&1
    [ -f "$OUTDIR/spots/ark-gen.jpeg" ] && mv "$OUTDIR/spots/ark-gen.jpeg" "$OUTDIR/spots/${name}.jpg"
    log "Waiting ${DELAY}s..."
    sleep $DELAY
done
log "Done"
