# Web Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.12.0

FROM base AS dependencies
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
COPY apps/api/src/trpc ./apps/api/src/trpc
COPY tsconfig.json ./

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build Next.js app
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

FROM base AS runtime
WORKDIR /app

# Copy runtime dependencies
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["node", "server.js"]
