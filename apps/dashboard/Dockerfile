FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/integration/ packages/integration/
COPY apps/dashboard/package.json apps/dashboard/
RUN pnpm install --frozen-lockfile --filter @creature/dashboard...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY apps/dashboard/ apps/dashboard/

ARG KEEPER_URL
ENV KEEPER_URL=$KEEPER_URL
ARG NEXT_PUBLIC_KEEPER_URL
ENV NEXT_PUBLIC_KEEPER_URL=$NEXT_PUBLIC_KEEPER_URL

WORKDIR /app/apps/dashboard
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/dashboard/server.js"]
