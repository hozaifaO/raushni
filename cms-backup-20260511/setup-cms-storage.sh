#!/bin/bash
# setup-cms-storage.sh

echo "🔧 Setting up CMS storage on external drive..."

# Create main directories
mkdir -p /Volumes/owsd1/raushni/cms/{uploads,config,api,postgres-data,backups,logs,temp}

# Create subdirectories
mkdir -p /Volumes/owsd1/raushni/uploads/images
mkdir -p /Volumes/owsd1/raushni/uploads/documents
mkdir -p /Volumes/owsd1/raushni/uploads/videos
mkdir -p /Volumes/owsd1/raushni/backups/daily
mkdir -p /Volumes/owsd1/raushni/backups/weekly

# Set permissions - read/write for current user
chmod -R 755 /Volumes/owsd1/raushni
chown -R $(whoami):staff /Volumes/owsd1/raushni

echo "✅ Directory structure created"
ls -la /Volumes/owsd1/raushni/