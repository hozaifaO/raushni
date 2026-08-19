/**
 * Upload: local by default; set AWS_BUCKET (+ keys/endpoint) for S3-compatible
 * storage (Railway Buckets, Cloudflare R2, etc.).
 */
function uploadConfig(env) {
  const sizeLimit = env.int('UPLOAD_SIZE_LIMIT', 10 * 1024 * 1024);
  const bucket = env('AWS_BUCKET', '');
  if (!bucket) {
    return { config: { sizeLimit } };
  }

  const endpoint = env('AWS_ENDPOINT', '');
  const region = env('AWS_REGION', 'auto');
  const baseUrl = env('AWS_BASE_URL', '');
  const rootPath = env('AWS_ROOT_PATH', '');
  const forcePathStyle = env.bool('AWS_FORCE_PATH_STYLE', Boolean(endpoint));
  // Railway/R2 often reject canned ACLs — omit unless explicitly set.
  const acl = env('AWS_ACL', '');

  const params = {
    Bucket: bucket,
    signedUrlExpires: env.int('AWS_SIGNED_URL_EXPIRES', 15 * 60),
  };
  if (acl) {
    params.ACL = acl;
  }

  const s3Options = {
    credentials: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_ACCESS_SECRET'),
    },
    region,
    params,
  };
  if (endpoint) {
    s3Options.endpoint = endpoint;
  }
  if (forcePathStyle) {
    s3Options.forcePathStyle = true;
  }

  const providerOptions = { s3Options };
  if (baseUrl) {
    providerOptions.baseUrl = baseUrl.replace(/\/$/, '');
  }
  if (rootPath) {
    providerOptions.rootPath = rootPath.replace(/^\/|\/$/g, '');
  }

  return {
    config: {
      sizeLimit,
      provider: 'aws-s3',
      providerOptions,
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  };
}

module.exports = ({ env }) => ({
  upload: uploadConfig(env),
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
