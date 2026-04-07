# 1. Base image setup
FROM oven/bun:1 AS base
WORKDIR /app

# 2. Dependency installation & Prisma generation
FROM base AS builder
COPY package.json bun.lockb* ./
COPY prisma ./prisma/
# Install dependencies
RUN bun install --frozen-lockfile
# Generate Prisma client
RUN bunx prisma generate
# Copy application code
COPY . .

# 3. Production release stage
FROM base AS release
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

# Expose standard port (Render will override via env var)
EXPOSE 3000/tcp

# Execute the start script
CMD ["bun", "run", "start"]
