#!/bin/sh
set -e

echo "Starting Bridgit Dashboard..."

# Ensure data directories exist and are writable by nextjs (uid 1001)
mkdir -p /app/data /app/public/uploads
chown -R 1001:1001 /app/data /app/public/uploads

# Auto-initialize database (creates tables + seeds if empty)
su -s /bin/sh nextjs -c "node src/db/init-db.mjs"

# Start the Next.js server as nextjs user
exec su -s /bin/sh nextjs -c "node server.js"
