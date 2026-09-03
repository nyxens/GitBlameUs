# Use official Node.js 22 LTS (Active LTS) based on Debian Bookworm Slim.
# Debian provides glibc compatibility (for native modules like bcrypt) with minimal footprint.
FROM node:22-bookworm-slim

WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Install build dependencies required for native modules (e.g. bcrypt / node-gyp)
# and clean up cache in the same layer to keep image small
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests first for optimal Docker layer caching
COPY package.json package-lock.json* ./

# Install production dependencies
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Remove build tools after dependency installation to reduce image attack surface
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y

# Copy application source code
COPY . .

# Adjust permissions and switch to non-root 'node' user provided by base image
USER node

# Expose backend API port
EXPOSE 5000

# Built-in health check using Node 22 native fetch API
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the Express server
CMD ["node", "server.js"]
