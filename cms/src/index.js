'use strict';

/**
 * Enable Public role find/findOne for Content API types.
 * Access is still gated by CMS_API_TOKEN middleware (X-CMS-API-Key).
 */
async function enablePublicContentRead(strapi) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) {
    strapi.log.warn('Public role not found — skip CMS public read bootstrap');
    return;
  }

  const actions = ['find', 'findOne'];
  const contentTypes = Object.keys(strapi.contentTypes).filter((uid) => uid.startsWith('api::'));

  for (const uid of contentTypes) {
    for (const action of actions) {
      const actionId = `${uid}.${action}`;
      const existing = await strapi.query('plugin::users-permissions.permission').findOne({
        where: { action: actionId, role: publicRole.id },
      });
      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: actionId, role: publicRole.id },
        });
      }
    }
  }

  strapi.log.info(
    `Enabled Public find/findOne for ${contentTypes.length} content types (still requires CMS_API_TOKEN).`,
  );
}

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    try {
      await enablePublicContentRead(strapi);
    } catch (error) {
      strapi.log.error('Failed to bootstrap Public CMS read permissions', error);
    }
  },
};
