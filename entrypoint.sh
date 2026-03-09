#!/bin/sh
# Point d'entrée Docker — Applique les migrations Prisma puis démarre Next.js
set -e

echo "🗄️  Application des migrations Prisma..."
node_modules/.bin/prisma migrate deploy

echo "🌱  Seed des comptes initiaux (idempotent)..."
node prisma/seed.js

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
