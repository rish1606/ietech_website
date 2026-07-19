FROM node:22-alpine AS build
WORKDIR /app

# Chromium for the prerender step (Puppeteer). Use the system browser instead of
# Puppeteer's bundled download to keep the image lean.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
# build:static = vite build + prerender (writes per-route HTML + sitemap.xml).
# The prerender reads published slugs from Firestore over the network at build time.
RUN npm run build:static

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
