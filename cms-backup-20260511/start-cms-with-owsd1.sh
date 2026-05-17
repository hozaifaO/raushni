#!/bin/bash

echo "🚀 Starting CMS with external storage on owsd1..."

# Check if external drive is mounted
if [ ! -d "/Volumes/owsd1" ]; then
    echo "❌ External drive 'owsd1' is not mounted!"
    echo "Please connect your external drive and try again."
    exit 1
fi

cd ~/Documents/raushni/cms

# Check if we're using the symlink
if [ ! -L ".." ] && [ ! -d "/Volumes/owsd1/raushni/cms" ]; then
    echo "❌ CMS not configured on external drive."
    echo "Run migrate-to-owsd1.sh first."
    exit 1
fi

# Start services
docker-compose -f docker-compose.owsd1.yml up -d

# Check status
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.owsd1.yml ps

echo ""
echo "📁 Storage Location: /Volumes/owsd1/raushni/cms"
echo "🌐 Admin Panel: http://localhost:1337/admin"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.owsd1.yml logs -f"