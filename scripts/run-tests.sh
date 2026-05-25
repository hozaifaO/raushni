#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Running Raushni Test Suite${NC}\n"

# Function to run backend tests
run_backend_tests() {
    echo -e "${YELLOW}📦 Running Backend Tests...${NC}"
    mkdir -p reports/backend
    PYTHONPATH=backend pytest tests/backend -v \
        --cov=app \
        --cov-report=term-missing \
        --cov-report=html:reports/backend/htmlcov \
        --cov-report=xml:reports/backend/coverage.xml \
        --junitxml=reports/backend/junit.xml
    echo -e "${GREEN}✅ Backend Tests Complete${NC}\n"
}

# Function to run frontend tests
run_frontend_tests() {
    echo -e "${YELLOW}⚛️ Running Frontend Tests...${NC}"
    cd frontend
    npm run test:ci
    cd ..
    echo -e "${GREEN}✅ Frontend Tests Complete${NC}\n"
}

# Function to run E2E tests
run_e2e_tests() {
    echo -e "${YELLOW}🌐 Running E2E Tests...${NC}"

    # Start services
    docker compose -f tests/docker/docker-compose.test.yml up -d

    # Wait for services
    sleep 10

    # Run E2E tests
    APP_BASE_URL="${APP_BASE_URL:-http://localhost:3000}" \
    API_BASE_URL="${API_BASE_URL:-http://localhost:8000}" \
    CMS_BASE_URL="${CMS_BASE_URL:-http://localhost:1337}" \
    node scripts/smoke-test.mjs

    # Stop services
    docker compose -f tests/docker/docker-compose.test.yml down

    echo -e "${GREEN}✅ E2E Tests Complete${NC}\n"
}

# Parse arguments
case "${1}" in
    backend)
        run_backend_tests
        ;;
    frontend)
        run_frontend_tests
        ;;
    e2e)
        run_e2e_tests
        ;;
    all)
        run_backend_tests
        run_frontend_tests
        run_e2e_tests
        ;;
    smoke)
        node scripts/smoke-test.mjs
        ;;
    performance)
        node scripts/performance-smoke.mjs
        ;;
    *)
        echo "Usage: $0 {backend|frontend|e2e|smoke|performance|all}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
