#!/bin/sh
set -e

echo "Starting Bridgit Dashboard..."

# Auto-initialize database (creates tables + seeds if empty)
node src/db/init-db.mjs

# Start the Next.js server
exec node server.js
