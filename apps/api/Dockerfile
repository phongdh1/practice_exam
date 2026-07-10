# NestJS API — monorepo build for Railway / Render / Fly.io
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS prune
COPY . .
RUN corepack prepare pnpm@8.15.9 --activate
RUN pnpm dlx turbo@2.5.4 prune @practice-exam/api --docker

FROM base AS deps
RUN corepack prepare pnpm@8.15.9 --activate
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY --from=prune /app/out/full/ .
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV DIRECT_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN pnpm turbo build --filter=@practice-exam/api

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api
EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/main.js"]
