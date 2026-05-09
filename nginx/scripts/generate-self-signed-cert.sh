#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SSL_DIR="${SSL_DIR:-$ROOT_DIR/ssl}"
DOMAIN="${1:-raushni.local}"
CERT_PATH="$SSL_DIR/raushni.crt"
KEY_PATH="$SSL_DIR/raushni.key"

mkdir -p "$SSL_DIR"

openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "$KEY_PATH" \
  -out "$CERT_PATH" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN,DNS:localhost,IP:127.0.0.1"

chmod 600 "$KEY_PATH"

printf 'Created certificate: %s\n' "$CERT_PATH"
printf 'Created key: %s\n' "$KEY_PATH"
