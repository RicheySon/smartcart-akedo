#!/bin/sh
# Vercel install helper: keep command short in vercel.json to satisfy schema
# Installs root deps if present, installs client deps (including dev) when client/package.json exists,
# and installs root deps when Vercel's cwd is inside client.
if [ -f package.json ]; then
  npm install --legacy-peer-deps
fi

if [ -f client/package.json ]; then
  (cd client && npm install --legacy-peer-deps --include=dev)
fi

if [ -f ../package.json ]; then
  (cd .. && npm install --legacy-peer-deps)
fi
