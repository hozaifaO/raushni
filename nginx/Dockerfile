FROM nginx:alpine

RUN apk add --no-cache curl openssl

# Remove default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/40-raushni-certificates.sh

# Create runtime directories
RUN mkdir -p /etc/nginx/ssl /var/www/certbot \
    && chmod +x /docker-entrypoint.d/40-raushni-certificates.sh

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
