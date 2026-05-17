'use strict';

const strapi = require('@strapi/strapi');

async function seed() {
  const app = await strapi().load();

  // Create default admin user if not exists
  const adminExists = await strapi.query('admin::user').findOne({ where: { email: 'admin@raushni.com' } });
  if (!adminExists) {
    await strapi.query('admin::user').create({
      data: {
        email: 'admin@raushni.com',
        username: 'admin',
        password: 'Admin123!@#',
        firstname: 'Admin',
        lastname: 'User',
        isActive: true,
        roles: [1],
      },
    });
    console.log('Admin user created');
  }

  // Create default designation
  const designation = await strapi.query('api::designation.designation').findOne({ where: { name: 'Volunteer' } });
  if (!designation) {
    await strapi.query('api::designation.designation').create({
      data: { name: 'Volunteer', priority: 1 },
    });
    console.log('Default designation created');
  }

  console.log('Seeding completed');
  process.exit(0);
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});