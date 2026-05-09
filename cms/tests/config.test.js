const adminConfig = require('../config/admin');
const apiConfig = require('../config/api');
const databaseConfig = require('../config/database');
const pluginsConfig = require('../config/plugins');
const serverConfig = require('../config/server');
const { createEnv } = require('./helpers/env');

describe('CMS configuration', () => {
  test('server config uses the expected host, port, keys, and public URL', () => {
    const config = serverConfig({ env: createEnv() });

    expect(config.host).toBe('0.0.0.0');
    expect(config.port).toBe(1337);
    expect(config.app.keys).toEqual(['key1', 'key2', 'key3', 'key4']);
    expect(config.url).toBe('http://localhost:1337');
    expect(config.admin.url).toBe('/admin');
  });

  test('database config points to Postgres with bounded pool settings', () => {
    const config = databaseConfig({ env: createEnv() });

    expect(config.connection.client).toBe('postgres');
    expect(config.connection.connection).toMatchObject({
      host: 'postgres',
      port: 5432,
      database: 'raushni_cms',
      user: 'strapi_user',
      password: 'strapi_password',
      ssl: false,
    });
    expect(config.connection.pool.min).toBeLessThanOrEqual(config.connection.pool.max);
  });

  test('admin and API configs keep sensitive fields private', () => {
    const admin = adminConfig({ env: createEnv() });
    const api = apiConfig({ env: createEnv() });

    expect(admin.auth.secret).toBe('admin-secret');
    expect(api.responses.privateAttributes).toEqual(
      expect.arrayContaining(['createdBy', 'updatedBy']),
    );
    expect(api.rest.maxLimit).toBeGreaterThanOrEqual(api.rest.defaultLimit);
  });

  test('plugin config enables upload, email, SEO, GraphQL, and users-permissions', () => {
    const plugins = pluginsConfig({ env: createEnv() });

    expect(plugins.email.config.provider).toBe('nodemailer');
    expect(plugins.upload.config.provider).toBe('aws-s3');
    expect(plugins.seo.enabled).toBe(true);
    expect(plugins.graphql.config.endpoint).toBe('/graphql');
    expect(plugins['users-permissions'].config.jwt.expiresIn).toBe('7d');
  });
});
