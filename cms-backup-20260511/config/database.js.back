module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'postgres'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'raushni_cms'),
      user: env('DATABASE_USERNAME', 'strapi_user'),
      password: env('DATABASE_PASSWORD', 'strapi_password'),
      schema: env('DATABASE_SCHEMA', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    debug: env.bool('DATABASE_DEBUG', false),
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
      acquireTimeoutMillis: env.int('DATABASE_TIMEOUT', 60000),
      createTimeoutMillis: env.int('DATABASE_CREATE_TIMEOUT', 30000),
      destroyTimeoutMillis: env.int('DATABASE_DESTROY_TIMEOUT', 5000),
      idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 60000),
      reapIntervalMillis: env.int('DATABASE_REAP_INTERVAL', 1000),
      createRetryIntervalMillis: env.int('DATABASE_CREATE_RETRY', 200),
    },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});