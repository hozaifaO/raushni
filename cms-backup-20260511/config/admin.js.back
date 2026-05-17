module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin-secret-change-me'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api-salt-change-me'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer-salt-change-me'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('ADMIN_URL', '/admin'),
  autoOpen: false,
  watchIgnoreFiles: [
    '**/__pycache__/**',
    '**/*.log',
  ],
});