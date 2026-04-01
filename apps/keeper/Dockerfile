FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy only the packages this service needs
COPY packages/integration/ packages/integration/
COPY apps/keeper/ apps/keeper/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @creature/keeper...

EXPOSE 3001

WORKDIR /app/apps/keeper
CMD ["pnpm", "start"]
