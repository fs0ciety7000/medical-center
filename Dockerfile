# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Étape 1: Installation des dépendances (cache optimisé)
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package managers files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies (on installe via npm pur si aucun lockfile n'est présent)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "No lockfile found. Falling back to clean npm install." && npm install; \
  fi

# On génère le client Prisma dès qu'on a les dépendances
RUN npx prisma generate

# Étape 2: Build de l'application Next.js (Standalone)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# On s'assure que next.config.js a bien output: "standalone"
# Ceci permet de drastiquement réduire la taille de l'image finale
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Étape 3: Image de production finale (Légère)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Créer un user non-root pour la sécurité (Standard SaaS Docker)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configuration Next.js stand-alone
COPY --from=builder /app/public ./public
# Set les permissions correctes pour le dossier prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copier les fichiers générés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch vers l'utilisateur sécurisé
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Démarrer le serveur web interne généré par Next (sans le wrapper NextCLI)
CMD ["node", "server.js"]
