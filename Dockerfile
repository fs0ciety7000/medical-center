# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install; \
  fi

RUN npx prisma generate

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
# Dummy URL to allow next-auth to build if referenced
ENV AUTH_URL="http://localhost:3000"
ENV AUTH_SECRET="placeholder_secret_for_build"

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else npm run build; \
  fi

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct permissions for nextjs user
RUN mkdir -p .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma CLI and generated files for runtime execution (entrypoint migrations)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

CMD ["./entrypoint.sh"]
