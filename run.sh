#!/usr/bin/env bash
# Ask My Notes - macOS / Linux Portable Launcher

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================"
echo "  Ask My Notes - Portable Launcher (macOS / Linux)"
echo "========================================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[Info] Dependencies missing. Running npm install..."
    npm install
fi

echo "[1/2] Starting QVAC Local Engine & Frontend..."
npm start &

sleep 3

echo "[2/2] Opening http://localhost:3000 in browser..."
if command -v open > /dev/null; then
    open http://localhost:3000
elif command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
fi

echo "========================================================"
echo "  Success! App running live at http://localhost:3000"
echo "========================================================"
