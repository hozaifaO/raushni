#!/bin/bash

echo "🔧 Setting up CMS locally (bypassing external drive issues)..."

# Create local CMS directory
mkdir -p ~/Documents/raushni/cms-local
cd ~/Documents/raushni/cms-local

# Create Dockerfile
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

# Create package.json
cat > package.json << 'EOF'
{
  "name": "raushni-cms",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "strapi start",
    "build": "strapi build"
  },
  "dependencies": {
    "@strapi/strapi": "4.15.5",
    "pg": "8.11.3"
  }
}
EOF

# Create config files
mkdir -p config
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
    },
  },
});
EOF

cat > config/server.js << 'EOF'
module.exports = ({ env }) => ({
  host: '0.0.0.0',
  port: 1337,
});
EOF

cat > config/admin.js << 'EOF'
module.exports = ({ env }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET', 'admin-secret') },
});
EOF

cat > config/plugins.js << 'EOF'
module.exports = () => ({});
EOF

# Create docker-compose
cat > docker-compose.owsd1.yml << 'EOF'
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
      retries: 10

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
    volumes:
      - /Volumes/owsd1/raushni/cms/uploads:/app/public/uploads
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
EOF

# Create uploads directory on external drive
mkdir -p /Volumes/owsd1/raushni/cms/uploads
chmod 755 /Volumes/owsd1/raushni/cms/uploads

echo "✅ Setup complete!"
echo ""
echo "Now run:"
echo "cd ~/Documents/raushni/cms-local"
echo "docker-compose -f docker-compose.owsd1.yml build --no-cache"
echo "docker-compose -f docker-compose.owsd1.yml up -d"