#!/bin/bash

echo "🔍 Verifying external drive storage..."

# Check mount
if mount | grep -q "owsd1"; then
    echo "✅ owsd1 is mounted"
    mount | grep owsd1
else
    echo "❌ owsd1 is not mounted"
    exit 1
fi

# Check directories
for dir in uploads config api postgres-data logs backups; do
    if [ -d "/Volumes/owsd1/raushni/cms/$dir" ]; then
        echo "✅ $dir directory exists"
    else
        echo "❌ $dir directory missing"
    fi
done

# Check disk space
echo ""
echo "💾 Disk Space on owsd1:"
df -h /Volumes/owsd1

# Check Docker volume mounts
echo ""
echo "🐳 Docker Volumes:"
docker volume ls | grep -E "raushni|owsd1"

