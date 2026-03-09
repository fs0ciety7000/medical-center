#!/bin/sh
# Point d'entrée Docker — Applique les migrations Prisma puis démarre Next.js
set -e

echo "🔍 Vérification des variables d'environnement critiques..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERREUR CRITIQUE: DATABASE_URL n'est pas définie."
  echo "🔧 Allez dans Coolify > Project > Variables d'environnement et ajoutez DATABASE_URL."
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "❌ ERREUR: AUTH_SECRET n'est pas défini. La connexion (NextAuth) va échouer."
fi

echo "🗄️  Synchronisation du schéma Prisma..."
node_modules/.bin/prisma db push --accept-data-loss || { echo "❌ Échec de Prisma db push"; exit 1; }

echo "🌱  Seed des comptes initiaux (idempotent)..."
node prisma/seed.js

echo "🚀 Démarrage du serveur Next.js..."
exec node server.js
