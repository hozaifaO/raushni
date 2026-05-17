#!/bin/bash

echo "🔄 Migrating CMS data to external drive owsd1..."

SOURCE_DIR="/Users/owaisahmad/Documents/raushni/cms"
TARGET_DIR="/Volumes/owsd1/raushni/cms"

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Create symlink from project to external drive
cd ~/Documents/raushni

# Backup existing CMS directory
if [ -d "cms" ] && [ ! -L "cms" ]; then
    echo "Backing up existing CMS directory..."
    mv cms cms-backup-$(date +%Y%m%d)
fi

# Create symlink
ln -s "$TARGET_DIR" cms

echo "✅ Symlink created: ~/Documents/raushni/cms -> $TARGET_DIR"

# Copy existing data if target is empty
if [ -z "$(ls -A $TARGET_DIR 2>/dev/null)" ]; then
    echo "Copying existing data to external drive..."
    cp -r "$SOURCE_DIR"/* "$TARGET_DIR/" 2>/dev/null || true
fi

echo "✅ Migration complete!"