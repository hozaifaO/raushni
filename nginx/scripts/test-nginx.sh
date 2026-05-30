#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

assert_file() {
  [ -f "$ROOT_DIR/$1" ] || fail "missing $1"
  pass "found $1"
}

assert_contains() {
  file="$1"
  pattern="$2"
  grep -Eq "$pattern" "$ROOT_DIR/$file" || fail "$file missing pattern: $pattern"
  pass "$file contains $pattern"
}

assert_file nginx.conf
assert_file default.conf
assert_file Dockerfile
assert_file docker-entrypoint.sh
assert_file scripts/generate-self-signed-cert.sh

assert_contains nginx.conf 'limit_req_zone .*zone=api'
assert_contains nginx.conf 'server_tokens off'
assert_contains default.conf 'listen 443 ssl'
assert_contains default.conf 'http2 on'
assert_contains default.conf 'ssl_protocols TLSv1.2 TLSv1.3'
assert_contains default.conf 'location /health'
assert_contains default.conf 'set \$frontend_upstream http://frontend:3000'
assert_contains default.conf 'set \$backend_api_upstream http://backend:8000/api/'
assert_contains default.conf 'set \$document_upstream http://document-generator:8000/'
assert_contains default.conf 'set \$cms_api_upstream http://strapi:1337/api/'
assert_contains default.conf 'Strict-Transport-Security'
assert_contains default.conf 'proxy_pass \$frontend_upstream'
assert_contains default.conf 'proxy_pass \$backend_upstream\$request_uri'
assert_contains default.conf 'rewrite \^/cms/api/'
assert_contains default.conf 'proxy_pass \$cms_upstream'
assert_contains default.conf 'proxy_pass \$document_upstream'
assert_contains Dockerfile 'apk add --no-cache curl openssl'
assert_contains Dockerfile '40-raushni-certificates.sh'

SSL_DIR="$TMP_DIR/ssl" "$ROOT_DIR/scripts/generate-self-signed-cert.sh" test.raushni.local >/dev/null 2>&1
[ -s "$TMP_DIR/ssl/raushni.crt" ] || fail "certificate was not created"
[ -s "$TMP_DIR/ssl/raushni.key" ] || fail "private key was not created"
openssl x509 -in "$TMP_DIR/ssl/raushni.crt" -noout -subject >/dev/null
pass "self-signed certificate generation"

if command -v nginx >/dev/null 2>&1; then
  mkdir -p "$TMP_DIR/conf.d" "$TMP_DIR/ssl" "$TMP_DIR/logs" "$TMP_DIR/run" "$TMP_DIR/certbot"
  cp "$ROOT_DIR/default.conf" "$TMP_DIR/conf.d/default.conf"
  cp "$TMP_DIR/ssl/raushni.crt" "$TMP_DIR/ssl/raushni.crt"
  cp "$TMP_DIR/ssl/raushni.key" "$TMP_DIR/ssl/raushni.key"
  sed \
    -e "s#/etc/nginx/mime.types#mime.types#g" \
    -e "s#/var/log/nginx/error.log#$TMP_DIR/logs/error.log#g" \
    -e "s#/var/run/nginx.pid#$TMP_DIR/run/nginx.pid#g" \
    -e "s#/etc/nginx/conf.d/\*.conf#$TMP_DIR/conf.d/*.conf#g" \
    -e "s#/etc/nginx/ssl#$TMP_DIR/ssl#g" \
    -e "s#/var/www/certbot#$TMP_DIR/certbot#g" \
    "$ROOT_DIR/nginx.conf" > "$TMP_DIR/nginx.conf"
  nginx -t -c "$TMP_DIR/nginx.conf" -p "$TMP_DIR" >/dev/null
  pass "nginx syntax"
else
  pass "nginx binary not installed; static config tests completed"
fi
