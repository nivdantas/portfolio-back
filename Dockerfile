# 1. Base image setup
FROM oven/bun:1 AS base
WORKDIR /app

# 2. Dependency installation & Prisma generation
FROM base AS builder
COPY package.json bun.lock ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
# Install dependencies
RUN bun install --frozen-lockfile
# Generate Prisma client
RUN bun --bun run prisma generate
# Copy application code
COPY src ./src

# 3. Production release stage
FROM base AS release
ENV NODE_ENV=production

# Install runtime dependencies and copy the source and generated client
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --from=builder /app/src ./src

# Expose standard port (Render will override via env var)
EXPOSE 3000/tcp

# Execute the start script
CMD ["bun", "run", "start"]
