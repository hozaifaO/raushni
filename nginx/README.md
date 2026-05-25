# Raushni nginx Gateway

[![nginx](https://img.shields.io/badge/nginx-reverse_proxy-009639)](https://nginx.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)
[![TLS](https://img.shields.io/badge/TLS-1.2%2F1.3-2E7D32)](https://nginx.org/en/docs/http/configuring_https_servers.html)

This directory contains the nginx reverse proxy for the Raushni platform. It terminates TLS, redirects HTTP to HTTPS, proxies traffic to the frontend, backend API, and CMS, serves health checks, applies basic rate limits, and provides certificate tooling for local and production-like deployments.

## Routes

| Route | Target |
| --- | --- |
| `/` | Next.js frontend at `frontend:3000` |
| `/api/` | Backend API at `backend:8000/api/` |
| `/api/auth/` | Backend auth API with stricter rate limiting |
| `/document-service/` | Document generation service at `document-generator:8000` |
| `/admin` | Strapi admin at `strapi:1337/admin` |
| `/cms/api/` | Strapi API at `strapi:1337/api/` |
| `/uploads/` | Strapi uploads at `strapi:1337/uploads/` |
| `/health` | Local nginx health response |
| `/.well-known/acme-challenge/` | ACME challenge directory for certificate automation |

## Files

| File | Purpose |
| --- | --- |
| `nginx.conf` | Global nginx process, logging, gzip, security, and rate-limit settings. |
| `default.conf` | Raushni virtual host, TLS, upstreams, and route proxying. |
| `Dockerfile` | Container image with nginx, curl, openssl, configs, and certificate entrypoint. |
| `docker-entrypoint.sh` | Generates a local self-signed certificate if no mounted certificate exists. |
| `docker-compose.yml` | Standalone nginx container setup for the shared Raushni Docker network. |
| `scripts/generate-self-signed-cert.sh` | Local certificate generator. |
| `scripts/test-nginx.sh` | Static config, certificate, and optional nginx syntax tests. |
| `ssl/` | Ignored certificate directory for local development. |
| `certbot/www/` | ACME HTTP challenge webroot mounted into the container. |

## Local Certificate

Generate a local self-signed certificate:

```bash
cd nginx
./scripts/generate-self-signed-cert.sh raushni.local
```

This creates:

```text
nginx/ssl/raushni.crt
nginx/ssl/raushni.key
```

The private key is ignored by git.

If no certificate is mounted in the container, the image entrypoint generates a self-signed certificate automatically so nginx can still boot for local development and container tests.

The standalone compose file mounts `./ssl` as writable so the same automatic certificate generation works when `ssl/raushni.crt` or `ssl/raushni.key` is missing.

## Production Certificates

For production, mount real certificates into:

```text
/etc/nginx/ssl/raushni.crt
/etc/nginx/ssl/raushni.key
```

Recommended sources:

- A cloud load balancer or ingress controller
- A secret manager mounted into the container
- Certbot or ACME automation writing into a mounted volume

The nginx config also exposes:

```text
/.well-known/acme-challenge/
```

from:

```text
/var/www/certbot
```

so ACME HTTP challenges can be wired in later.

## Container Usage

Build the image:

```bash
cd nginx
docker build -t raushni-nginx .
```

Run it directly:

```bash
docker run --rm -p 80:80 -p 443:443 raushni-nginx
```

Run it against the shared Raushni network:

```bash
cd nginx
docker-compose up -d
```

The standalone compose file expects the external Docker network `raushni_network` to exist. The root `docker-compose.yml` creates that network when the full stack is running.

## Full Stack Usage

From the repository root:

```bash
docker-compose up -d nginx
```

nginx expects these service DNS names on the Docker network:

| Name | Service |
| --- | --- |
| `frontend` | Next.js frontend |
| `backend` | FastAPI backend |
| `strapi` | CMS |

The config uses Docker DNS resolver `127.0.0.11` and runtime upstream variables so the image can pass syntax checks before upstream service containers are running.

## Tests

Run static and certificate tests:

```bash
cd nginx
./scripts/test-nginx.sh
```

The test script checks:

- Required nginx files exist.
- TLS, route, rate-limit, proxy, and Dockerfile settings are present.
- Self-signed certificate generation works.
- nginx syntax is valid when the `nginx` binary is installed locally.

Container syntax test:

```bash
docker build -t raushni-nginx-test .
docker run --rm raushni-nginx-test nginx -t
```

Runtime health test:

```bash
docker run --rm -d --name raushni-nginx-test -p 8080:80 -p 8443:443 raushni-nginx-test
curl http://localhost:8080/health
docker rm -f raushni-nginx-test
```

If host networking is unavailable in your environment, verify health from inside the container:

```bash
docker exec raushni-nginx-test curl -fsS http://localhost/health
```

## Security Defaults

- HTTP redirects to HTTPS, except `/health` and ACME challenge files.
- TLS 1.2 and 1.3 are enabled.
- Weak ciphers are excluded.
- `server_tokens` is disabled.
- `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy` are set globally.
- API routes have request rate limits.
- Hidden files are denied.

## Troubleshooting

Check nginx syntax:

```bash
nginx -t -c "$(pwd)/nginx.conf"
```

Check container logs:

```bash
docker logs raushni-nginx
```

If HTTPS fails locally, regenerate the local certificate:

```bash
rm -f ssl/raushni.crt ssl/raushni.key
./scripts/generate-self-signed-cert.sh raushni.local
```

If upstream requests fail, confirm the upstream containers are on the same Docker network and use the expected service names: `frontend`, `backend`, and `strapi`.
