#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push
echo "🌱 Seeding initial demo data..."
npx tsx prisma/seed.ts
if [ $? -ne 0 ]; then
  echo "⚠️ Seed script failed (non-fatal, continuing...)"
fi

echo "🚀 Starting Momentum API Server..."
exec node dist/server.js
