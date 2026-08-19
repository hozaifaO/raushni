FROM node:20-alpine AS base

WORKDIR /opt/app
ENV NODE_ENV=production

RUN apk add --no-cache \
  build-base \
  cairo-dev \
  curl \
  git \
  jpeg-dev \
  pango-dev \
  pixman-dev \
  python3 \
  vips-dev

COPY package*.json ./

FROM base AS dependencies
RUN npm install --legacy-peer-deps

FROM dependencies AS build
# Admin SPA bakes STRAPI_ADMIN_BACKEND_URL at build time. Empty = same-origin
# (works for http://localhost:1337 and https://localhost/admin via nginx).
ARG STRAPI_ADMIN_BACKEND_URL=
ENV STRAPI_ADMIN_BACKEND_URL=$STRAPI_ADMIN_BACKEND_URL
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /opt/app
ENV NODE_ENV=production

RUN apk add --no-cache curl vips vips-cpp \
  && addgroup -S strapi \
  && adduser -S strapi -G strapi

COPY --from=build --chown=strapi:strapi /opt/app ./

RUN mkdir -p public/uploads .tmp \
  && chown -R strapi:strapi /opt/app

USER strapi

EXPOSE 1337

# Railway injects PORT; default 1337 for local/docker.
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT:-1337}/_health || exit 1

CMD npm start
