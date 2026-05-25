#!/usr/bin/env bash

# Generate coverage reports for all services
set -euo pipefail

echo "📊 Generating coverage reports..."

mkdir -p reports/backend
PYTHONPATH=backend pytest tests/backend -v \
  --cov=app \
  --cov-report=term-missing \
  --cov-report=html:reports/backend/htmlcov \
  --cov-report=xml:reports/backend/coverage.xml \
  --junitxml=reports/backend/junit.xml

# Frontend coverage
cd frontend
npm run test:coverage
cd ..

# Merge coverage reports (if using Codecov)
echo "✅ Coverage reports generated in:"
echo "  - reports/backend/htmlcov/"
echo "  - frontend/coverage/"
echo "  - backend/coverage.xml"
echo "  - frontend/coverage/lcov.info"
