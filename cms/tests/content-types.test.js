const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'api');
const schemaPaths = fs
  .readdirSync(apiDir)
  .map((apiName) => path.join(apiDir, apiName, 'content-types', apiName, 'schema.json'))
  .filter((schemaPath) => fs.existsSync(schemaPath));

describe('CMS content type schemas', () => {
  test.each(schemaPaths)('%s is valid Strapi collection schema', (schemaPath) => {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const apiName = path.basename(path.dirname(path.dirname(path.dirname(schemaPath))));

    expect(schema.kind).toBe('collectionType');
    expect(schema.collectionName).toBeTruthy();
    expect(schema.info.displayName).toBeTruthy();
    expect(schema.info.singularName).toBe(apiName);
    expect(schema.info.pluralName).toBeTruthy();
    expect(schema.attributes).toBeTruthy();
    expect(Object.keys(schema.attributes).length).toBeGreaterThan(0);
  });

  test('public content schemas include SEO metadata', () => {
    const seoSchemas = ['activity', 'event', 'news', 'project', 'report'];

    seoSchemas.forEach((apiName) => {
      const schemaPath = path.join(apiDir, apiName, 'content-types', apiName, 'schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

      expect(schema.attributes.seo).toMatchObject({
        type: 'component',
        component: 'shared.seo',
      });
    });
  });

  test('member schema protects unique member identity fields', () => {
    const schemaPath = path.join(apiDir, 'member', 'content-types', 'member', 'schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    expect(schema.attributes.memberId).toMatchObject({ required: true, unique: true });
    expect(schema.attributes.email).toMatchObject({ type: 'email', required: true, unique: true });
    expect(schema.attributes.status.enum).toEqual(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
  });
});
