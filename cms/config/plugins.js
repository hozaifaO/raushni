module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT', 10 * 1024 * 1024),
    },
  },
  email: {
    config: {
      provider: env('EMAIL_PROVIDER', 'sendmail'),
      providerOptions: {},
      settings: {
        defaultFrom: env('EMAIL_DEFAULT_FROM', 'info@raushni.com'),
        defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'info@raushni.com'),
      },
    },
  },
});
