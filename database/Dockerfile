FROM postgres:15-alpine

# Install additional tools for backup and monitoring
RUN apk add --no-cache \
    postgresql-contrib \
    postgis \
    curl \
    jq \
    pigz \
    && rm -rf /var/cache/apk/*

# Copy custom configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Copy initialization scripts (they run in alphabetical order)
COPY init.sql /docker-entrypoint-initdb.d/00-init.sql
COPY migrations/ /docker-entrypoint-initdb.d/migrations/
COPY scripts/seed_data.sql /docker-entrypoint-initdb.d/99-seed.sql

# Copy custom entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy backup and restore scripts
COPY backups/backup.sh /usr/local/bin/backup.sh
COPY backups/restore.sh /usr/local/bin/restore.sh
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

# Create directories for backups and logs
RUN mkdir -p /var/backups/postgres /var/log/postgresql && \
    chown postgres:postgres /var/backups/postgres /var/log/postgresql

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=5 \
    CMD pg_isready -U postgres || exit 1

# Use custom entrypoint
ENTRYPOINT ["entrypoint.sh"]
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]