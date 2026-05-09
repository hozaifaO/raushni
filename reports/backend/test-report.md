# Backend Containerized Test Report

Date: 2026-05-09

Command:

```bash
docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
```

Result: PASS

Summary:

- Total tests: 8
- Passed: 8
- Failed: 0
- Coverage: 95.65%
- Coverage threshold: 80%

Test layers:

- Unit: app factory configuration and route registration
- Mock: `uvicorn.run` entrypoint call
- Integration: health endpoint, API root contract, CORS preflight
- E2E: public API smoke workflow

Generated artifacts:

- JUnit XML: `reports/backend/junit.xml`
- Coverage XML: `reports/backend/coverage.xml`
- HTML coverage: `reports/backend/htmlcov/index.html`
