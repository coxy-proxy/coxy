# ============================================
# Build stage
# ============================================
FROM node:22-alpine AS builder
LABEL org.opencontainers.image.source=https://github.com/coxy-proxy/coxy

WORKDIR /app

# Enable corepack to manage pnpm
RUN corepack enable

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

# Prepare dependencies for production
RUN pnpm prune --prod --ignore-scripts
RUN cp -r ./node_modules /app/prod/

# ============================================
# Production stage
# ============================================
FROM node:22-alpine
WORKDIR /app

ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLE=1

# Copy production app from build stage
COPY --from=builder /app/prod/ ./

# To support CLI arguments
ENTRYPOINT ["bin/cli.js"]
