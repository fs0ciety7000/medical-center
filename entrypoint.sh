#!/bin/sh
# Point d'entrée Docker — Applique les migrations Prisma puis démarre Next.js
set -e

echo "🗄️  Synchronisation du schéma Prisma..."
node_modules/.bin/prisma db push --accept-data-loss

echo "🌱  Seed des comptes initiaux (idempotent)..."
node prisma/seed.js

echo "🌱  Seed des comptes initiaux (idempotent)..."
node prisma/seed.js

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
