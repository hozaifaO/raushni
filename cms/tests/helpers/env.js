function createEnv(overrides = {}) {
  const values = {
    HOST: '0.0.0.0',
    PORT: '1337',
    APP_KEYS: 'key1,key2,key3,key4',
    ADMIN_JWT_SECRET: 'admin-secret',
    API_TOKEN_SALT: 'api-token-salt',
    TRANSFER_TOKEN_SALT: 'transfer-token-salt',
    JWT_SECRET: 'jwt-secret',
    DATABASE_HOST: 'postgres',
    DATABASE_PORT: '5432',
    DATABASE_NAME: 'raushni_cms',
    DATABASE_USERNAME: 'strapi_user',
    DATABASE_PASSWORD: 'strapi_password',
    DATABASE_SSL: 'false',
    PUBLIC_URL: 'http://localhost:1337',
    SMTP_PORT: '587',
    GRAPHQL_PLAYGROUND: 'true',
    ...overrides,
  };

  const env = (key, fallback) => values[key] ?? fallback;
  env.int = (key, fallback) => Number.parseInt(values[key] ?? fallback, 10);
  env.bool = (key, fallback) => {
    const value = values[key];
    if (value === undefined) return fallback;
    return value === true || value === 'true';
  };
  env.array = (key, fallback = []) => {
    const value = values[key];
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return fallback;
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  };

  return env;
}

module.exports = { createEnv };
