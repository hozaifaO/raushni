#!/bin/sh
set -eu

CERT_PATH="${NGINX_SSL_CERT:-/etc/nginx/ssl/raushni.crt}"
KEY_PATH="${NGINX_SSL_KEY:-/etc/nginx/ssl/raushni.key}"
CERT_CN="${NGINX_SSL_CN:-raushni.com}"

mkdir -p "$(dirname "$CERT_PATH")" "$(dirname "$KEY_PATH")" /var/www/certbot

if [ ! -s "$CERT_PATH" ] || [ ! -s "$KEY_PATH" ]; then
  echo "No TLS certificate found. Generating a local self-signed certificate for ${CERT_CN}."
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$KEY_PATH" \
    -out "$CERT_PATH" \
    -subj "/CN=${CERT_CN}" \
    >/dev/null 2>&1
fi

chmod 600 "$KEY_PATH"
