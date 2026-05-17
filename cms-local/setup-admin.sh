#!/bin/bash

echo "🔧 Setting up Strapi Admin..."

# Use single quotes to avoid zsh interpretation
docker exec -it raushni-cms npm run strapi admin:create-user -- \
  --email='admin@raushni.com' \
  --password='Admin123!@#' \
  --firstname='Admin' \
  --lastname='User'

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin user created/updated!"
    echo ""
    echo "Login at: http://localhost:1337/admin"
    echo "Email: admin@raushni.com"
    echo "Password: Admin123!@#"
else
    echo ""
    echo "⚠️  Admin user may already exist"
    echo "Try logging in at: http://localhost:1337/admin"
fi