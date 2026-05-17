#!/bin/bash

echo "🔧 Setting up CMS with correct Node version..."

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ] || [ "$NODE_VERSION" -gt 20 ]; then
    echo "⚠️  Wrong Node.js version: $NODE_VERSION"
    echo "Required: Node.js 18-20"

    if command -v nvm &> /dev/null; then
        echo "📦 Installing Node.js 20 using nvm..."
        nvm install 20
        nvm use 20
    else
        echo "Please install Node.js 18 or 20"
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
fi

echo "✅ Node version: $(node --version)"

# Clean install
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install

echo "✅ Setup complete!"
echo "🚀 Run 'npm run develop' to start Strapi"