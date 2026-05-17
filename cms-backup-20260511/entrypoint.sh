#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL started"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build admin panel
npm run build

# Run database migrations
npm run strapi migrate:up

# Start Strapi
exec "$@"