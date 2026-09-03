# ==============================================================================
# Frontend Dockerfile: Multi-stage build (React/Vite + Nginx Static Serving)
# ==============================================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies required for Vite build)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy frontend source code and compile
COPY . .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ==============================================================================
# Production Server Stage
# ==============================================================================
FROM nginx:alpine-slim

# Copy built SPA assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Self-contained Nginx configuration (handles React SPA routing & API reverse proxy)
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /api/ {\n\
        resolver 127.0.0.11 1.1.1.1 valid=30s ipv6=off;\n\
        set $backend_target http://backend:5000;\n\
        proxy_pass $backend_target;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
