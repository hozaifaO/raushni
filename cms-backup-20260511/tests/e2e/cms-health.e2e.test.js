const runE2E = process.env.RUN_CMS_E2E === 'true';
const describeE2E = runE2E ? describe : describe.skip;
const baseUrl = process.env.CMS_BASE_URL || 'http://localhost:1337';

describeE2E('CMS end-to-end health checks', () => {
  test('admin app responds', async () => {
    const response = await fetch(`${baseUrl}/admin`, { redirect: 'follow' });

    expect([200, 301, 302]).toContain(response.status);
  });

  test('GraphQL endpoint is reachable when enabled', async () => {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    expect([200, 400, 401, 403]).toContain(response.status);
  });
});
