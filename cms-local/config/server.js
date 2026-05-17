module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', [
      'myKeyA1234567890abcdefghijklmnopqrstuvwxyz',
      'myKeyB1234567890abcdefghijklmnopqrstuvwxyz',
      'myKeyC1234567890abcdefghijklmnopqrstuvwxyz',
      'myKeyD1234567890abcdefghijklmnopqrstuvwxyz'
    ]),
  },
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'admin-secret-key-change-in-production'),
    },
  },
});
