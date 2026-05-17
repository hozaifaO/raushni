#!/bin/bash

echo "🔧 Final CMS Fix..."

cd ~/Documents/raushni/cms

# Stop everything
docker-compose -f docker-compose.cms-simple.yml down -v 2>/dev/null || true

# Remove containers
docker rm -f raushni-cms raushni-cms-db 2>/dev/null || true

# Clean local files
rm -rf node_modules package-lock.json .cache build

# Create config directory
#mkdir -p config

# Create minimal configs
cat > config/database.js << 'EOF'
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'postgres'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'postgres'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'postgres'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
EOF

cat > config/server.js << 'EOF'
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: { keys: env.array('APP_KEYS', ['key1', 'key2']) },
  admin: { auth: { secret: env('ADMIN_JWT_SECRET', 'secret') } },
});
EOF

cat > config/admin.js << 'EOF'
module.exports = ({ env }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET', 'secret') },
});
EOF

cat > config/plugins.js << 'EOF'
module.exports = () => ({});
EOF

# Create empty .env file
touch .env

# Create Dockerfile.simple
cat > Dockerfile.simple << 'EOF'
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache vips-dev python3 make g++ gcc curl
COPY package*.json ./
RUN npm install --no-optional --legacy-peer-deps
COPY . .
RUN mkdir -p public/uploads
EXPOSE 1337
CMD ["npm", "start"]
EOF

# Create docker-compose
cat > docker-compose.cms-simple.yml << 'EOF'
services:
  postgres:
    image: postgres:15-alpine
    container_name: raushni-cms-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build:
      context: .
      dockerfile: Dockerfile.simple
    container_name: raushni-cms
    ports:
      - "1337:1337"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: postgres
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: postgres
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./public/uploads:/app/public/uploads

volumes:
  postgres_data:
EOF

# Clean Docker
docker system prune -f

# Rebuild and run
docker-compose -f docker-compose.cms-simple.yml up --build -d

echo "✅ CMS fix complete!"
echo "📊 Check logs: docker-compose -f docker-compose.cms-simple.yml logs -f"
echo "🌐 Admin panel: http://localhost:1337/admin"