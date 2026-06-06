#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const secretId = process.env.AWS_SECRET_ID || "/raushni/production/app";
const region = process.env.AWS_REGION || "ap-south-1";

const requiredKeys = [
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "BACKEND_DATABASE_URL",
  "CMS_DATABASE_NAME",
  "CMS_DATABASE_HOST",
  "CMS_DATABASE_PORT",
  "CMS_DATABASE_USERNAME",
  "CMS_DATABASE_PASSWORD",
  "CMS_DATABASE_SSL",
  "REDIS_PASSWORD",
  "REDIS_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_ADMIN_EMAIL",
  "NEXTAUTH_ADMIN_PASSWORD",
  "NEXTAUTH_STAFF_EMAIL",
  "NEXTAUTH_STAFF_PASSWORD",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRAPI_APP_KEYS",
  "STRAPI_API_TOKEN_SALT",
  "STRAPI_ADMIN_JWT_SECRET",
  "STRAPI_JWT_SECRET",
  "STRAPI_TRANSFER_TOKEN_SALT",
  "DD_API_KEY",
];

const missing = requiredKeys.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const payload = Object.fromEntries(requiredKeys.map((key) => [key, process.env[key]]));
const directory = mkdtempSync(join(tmpdir(), "raushni-secrets-"));
const secretFile = join(directory, "secret.json");

try {
  writeFileSync(secretFile, JSON.stringify(payload), { mode: 0o600 });

  const result = spawnSync(
    "aws",
    [
      "secretsmanager",
      "put-secret-value",
      "--region",
      region,
      "--secret-id",
      secretId,
      "--secret-string",
      `file://${secretFile}`,
    ],
    { stdio: "inherit" },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
} finally {
  rmSync(directory, { force: true, recursive: true });
}
