# ============================================
# Build stage
# ============================================
FROM node:22-bookworm-slim AS builder
LABEL org.opencontainers.image.source=https://github.com/coxy-proxy/coxy

WORKDIR /app

# Enable corepack to manage pnpm
RUN corepack enable

# Form prisma
RUN apt-get update && apt-get install -y openssl

# Copy lockfile and package.json first to leverage cache
# TODO: use `COPY --link`
COPY package.json pnpm-lock.yaml prisma .env.default ./

ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile && pnpm cache delete

# Copy all source files
COPY . .

# Build the app to create the dist folder
RUN pnpm run build

# Prepare the releasing package same as doing `npm publish`
RUN npm pack && \
  tar -zxvf *.tgz && \
  mv /app/package /app/prod

# Install only production dependencies
RUN cd /app/prod && pnpm install --prod

# ============================================
# Production stage
# ============================================
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app

ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLE=1

# Copy production app from build stage
COPY --from=builder /app/prod/ ./

CMD ["bin/cli.js"]
