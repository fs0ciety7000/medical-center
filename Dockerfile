# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile multistage optimisé pour Next.js 14 Standalone + Coolify
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base

# ── Étape 1 : Installation des dépendances ───────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Installation des dépendances et génération du client Prisma
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install; \
  fi

RUN npx prisma generate

# ── Étape 2 : Build Next.js (output standalone) ───────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# DATABASE_URL factice pour le build (Prisma n'est pas contacté au build time)
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else npm run build; \
  fi

# ── Étape 3 : Image de production finale (légère) ────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Fichiers statiques publics (mkdir -p au cas où le dossier serait vide)
RUN mkdir -p ./public
COPY --from=builder /app/public ./public

# Cache de pré-rendu
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copie du build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copie de Prisma CLI + migrations pour le script d'entrée
# Prisma 5.x bundle des fichiers .wasm dans node_modules/.bin/ — on copie tout le répertoire
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Script d'entrée (migrations + démarrage)
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

CMD ["./entrypoint.sh"]
