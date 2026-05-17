#!/bin/sh
set -e

# Create backup directory if not exists
mkdir -p /var/backups/postgres
chown postgres:postgres /var/backups/postgres

# Delegate initialization and server startup to the official Postgres entrypoint.
exec docker-entrypoint.sh "$@"
