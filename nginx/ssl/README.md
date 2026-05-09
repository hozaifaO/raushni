# TLS Certificates

Place local or production TLS files here when running nginx outside a secret manager:

```text
raushni.crt
raushni.key
```

The private key is intentionally ignored by git.

For local development, generate a self-signed certificate:

```bash
./scripts/generate-self-signed-cert.sh raushni.local
```

For production, mount certificates into `/etc/nginx/ssl` from your deployment system or secret manager.
