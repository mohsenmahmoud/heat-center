#!/usr/bin/env sh
# Run ./start.sh: installs on first run, builds the UI, opens the browser and starts the studio.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Download the LTS version from https://nodejs.org and run ./start.sh again."
  exit 1
fi
node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)' || {
  echo "Your Node.js is too old. Install the latest LTS from https://nodejs.org and run ./start.sh again."
  exit 1
}
[ -f .env ] || cp .env.example .env
# Runs every time so updates that add packages just work (fast when nothing changed).
npm install --no-audit --no-fund --loglevel=error || exit 1
npm run build --silent || exit 1
( sleep 3; (open http://localhost:5174 || xdg-open http://localhost:5174) >/dev/null 2>&1 ) &
echo "Keep this window open while you use the app. Press Ctrl+C to stop."
exec node --disable-warning=ExperimentalWarning server/index.js
