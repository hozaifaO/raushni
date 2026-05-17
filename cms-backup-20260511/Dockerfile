FROM node:20-alpine

WORKDIR /app

# Install dependencies for sharp and other native modules
RUN apk add --no-cache \
    vips-dev \
    build-base \
    gcc \
    autoconf \
    automake \
    make \
    libtool \
    nasm \
    libpng-dev \
    libjpeg-turbo-dev \
    tiff-dev \
    giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install

# Copy source code
COPY . .

# Build Strapi admin panel
RUN npm run build

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:1337/_health || exit 1

# Run Strapi
CMD ["npm", "start"]