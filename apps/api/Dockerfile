# API Server Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.12.0

FROM base AS dependencies
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.json ./

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Generate Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma generate

# Build API
RUN pnpm build

FROM base AS runtime
WORKDIR /app

# Copy built artifacts
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
