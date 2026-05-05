#!/usr/bin/env bash
# Regenerate the ASCII portrait in src/splash.ts from docs/portrait.png.
#
# Requires: chafa (brew install chafa)
#
# To regenerate the source PNG itself (one-time, costs OpenAI credits):
#   curl -s https://api.openai.com/v1/images/generations \
#     -H "Authorization: Bearer $OPENAI_API_KEY" \
#     -H "Content-Type: application/json" \
#     -d '{"model":"gpt-image-1","prompt":"<see commit log>","size":"1024x1024","n":1,"quality":"high","output_format":"png"}' \
#     | jq -r '.data[0].b64_json' | base64 -d > docs/portrait.png

set -euo pipefail
cd "$(dirname "$0")/.."

chafa --format symbols --symbols block+vhalf --colors none --invert -s 46x46 \
  docs/portrait.png \
  | sed 's/[[:space:]]*$//'
