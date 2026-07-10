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
# Prisma schema is not in turbo prune's json stage; skip postinstall until full source is copied.
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS builder
COPY --from=prune /app/out/full/ .
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV DIRECT_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN pnpm --filter @practice-exam/api exec prisma generate
RUN pnpm turbo build --filter=@practice-exam/api

FROM builder AS deploy
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV DIRECT_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN pnpm --filter @practice-exam/api deploy --prod /prod/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deploy /prod/api .
EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/main.js"]
