#!/usr/bin/env sh
# Double-click (or run ./start.sh) to install on first run and open the studio.
cd "$(dirname "$0")" || exit 1
[ -f .env ] || cp .env.example .env
[ -d node_modules ] || npm install
npm start
