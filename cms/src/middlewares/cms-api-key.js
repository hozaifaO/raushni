'use strict';

const crypto = require('crypto');

/**
 * Require CMS_API_TOKEN via X-CMS-API-Key on Content API `/api/*`.
 * Uses a custom header (not Authorization) so Strapi users-permissions
 * does not treat the service key as a JWT / API token.
 */
module.exports = (config, { strapi }) => {
  const expected = () =>
    String(process.env.CMS_API_TOKEN || process.env.STRAPI_CMS_API_TOKEN || '').trim();

  const allowPublic = () =>
    String(process.env.CMS_ALLOW_PUBLIC || '').toLowerCase() === 'true';

  const isProductionLike = () => {
    const env = String(process.env.ENVIRONMENT || '').toLowerCase();
    if (env === 'development' || env === 'dev' || env === 'local') return false;
    if (env === 'production' || env === 'staging') return true;
    return String(process.env.CMS_REQUIRE_TOKEN || '').toLowerCase() === 'true';
  };

  const extractToken = (ctx) => {
    const headerKey = ctx.request.header['x-cms-api-key'];
    if (headerKey && String(headerKey).trim()) {
      return String(headerKey).trim();
    }
    return '';
  };

  const tokensEqual = (provided, expectedToken) => {
    if (!provided || !expectedToken) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expectedToken);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  };

  return async (ctx, next) => {
    const path = ctx.request.path || '';

    if (!path.startsWith('/api')) {
      return next();
    }

    const token = expected();
    if (!token) {
      if (allowPublic() && !isProductionLike()) {
        strapi.log.warn('CMS_API_TOKEN unset; CMS_ALLOW_PUBLIC=true — Content API is open (local only).');
        return next();
      }
      if (isProductionLike() || !allowPublic()) {
        ctx.status = 401;
        ctx.body = {
          error: { status: 401, name: 'Unauthorized', message: 'CMS_API_TOKEN is not configured.' },
        };
        return;
      }
      strapi.log.warn('CMS_API_TOKEN unset — Content API open for local DX. Set CMS_API_TOKEN to lock it.');
      return next();
    }

    const provided = extractToken(ctx);
    if (!tokensEqual(provided, token)) {
      ctx.status = 401;
      ctx.body = {
        error: { status: 401, name: 'Unauthorized', message: 'Valid CMS API key is required.' },
      };
      return;
    }

    return next();
  };
};
