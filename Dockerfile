# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Enable corepack to manage pnpm
RUN corepack enable

# Copy lockfile and package.json first to leverage cache
COPY package.json pnpm-lock.yaml ./

# Pre-fetch dependencies with cache mount for pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile

# Install dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the app to create the dist folder
RUN pnpm run build

# Prepare the releasing package same as doing `npm publish`
RUN npm pack && \
  tar -zxvf *.tgz && \
  mv /app/package /app/prod

# Install only production dependencies ignoring scripts, using cache mount
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  cd /app/prod && pnpm install --prod --ignore-scripts

# Production stage
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app

# Copy production app from build stage
COPY --from=builder /app/prod/ ./
ENV HOST=0.0.0.0

CMD ["bin/cli.js"]
