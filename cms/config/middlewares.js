const csv = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

module.exports = ({ env }) => {
  const publicUrl = env('PUBLIC_URL', 'http://localhost:1337');
  const adminUrl = env('ADMIN_URL', '/admin');
  const configuredOrigins = csv(env('CORS_ORIGINS', ''));
  const localOrigins = ['http://localhost', 'http://localhost:80', 'http://localhost:1337', 'http://localhost:3000', 'http://localhost:3001'];
  const urlOrigins = [publicUrl, adminUrl]
    .filter((value) => value && value.startsWith('http'))
    .map((value) => new URL(value).origin);
  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...localOrigins, ...urlOrigins]));

  return [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'http:', 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', publicUrl],
          'media-src': ["'self'", 'data:', 'blob:', publicUrl],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-CMS-API-Key'],
      keepHeaderOnError: true,
    },
  },
  // Gate Content API with CMS_API_TOKEN (see src/middlewares/cms-api-key.js).
  'global::cms-api-key',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  {
    name: 'strapi::favicon',
    config: {
      path: 'favicon.ico',
    },
  },
  'strapi::public',
  ];
};
