#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma db push --accept-data-loss
echo "🌱 Seeding initial demo data..."
npx tsx prisma/seed.ts || echo "⚠️ Seed script failed (non-fatal, continuing...)"

echo "🚀 Starting Momentum API Server..."
exec node dist/server.js
