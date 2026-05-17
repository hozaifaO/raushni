#!/bin/bash

echo "🔧 Setting up CMS on external drive owsd1..."

# Check if owsd1 is mounted
if [ ! -d "/Volumes/owsd1" ]; then
    echo "❌ Error: owsd1 drive not found in /Volumes/"
    echo "Please ensure your external drive 'owsd1' is connected and mounted."
    echo "Current mounted drives:"
    ls /Volumes/
    exit 1
fi

echo "✅ owsd1 found at /Volumes/owsd1"

cd ~/Documents/raushni/cms

# Create directory structure
echo "Creating directory structure on owsd1..."
mkdir -p /Volumes/owsd1/raushni/cms/{uploads,config,api,postgres-data,backups}

# Create config files on owsd1 if they don't exist
if [ ! -f "/Volumes/owsd1/raushni/cms/config/database.js" ]; then
    cat > /Volumes/owsd1/raushni/cms/config/database.js << 'EOFCONFIG'
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
EOFCONFIG
fi

if [ ! -f "/Volumes/owsd1/raushni/cms/config/server.js" ]; then
    cat > /Volumes/owsd1/raushni/cms/config/server.js << 'EOFCONFIG'
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'admin-secret'),
    },
  },
});
EOFCONFIG
fi

if [ ! -f "/Volumes/owsd1/raushni/cms/config/admin.js" ]; then
    cat > /Volumes/owsd1/raushni/cms/config/admin.js << 'EOFCONFIG'
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin-secret'),
  },
});
EOFCONFIG
fi

if [ ! -f "/Volumes/owsd1/raushni/cms/CMScn I'm ready to help with the CMS storage configuration. Let me provide you with a comprehensive setup for using your external drive.

# 📁 Complete CMS Storage Setup with External Drive

## Step 1: Mount the External Drive Permanently

### Option A: Using macOS Disk Utility (Recommended for GUI)
1. Open Disk Utility
2. Find your "owsd1" drive
3. Right-click and select "Get Info"
4. Enable "Ignore ownership on this volume"

### Option B: Command-line mount (for consistency)
```bash
# Create mount point if it doesn't exist
sudo mkdir -p /Volumes/owsd1

# Mount the drive by its UUID (find it first)
diskutil info /dev/disk2s1 | grep "Volume UUID"

# Add to /etc/fstab for auto-mount (macOS)
echo "UUID=YOUR_UUID_HERE /Volumes/owsd1 apfs rw,auto,nobrowse" | sudo tee -a /etc/fstab