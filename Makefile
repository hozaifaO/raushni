.PHONY: help dev-hosts dev-up dev-down push-aws-secrets test test-backend test-backend-unit test-backend-integration test-frontend test-e2e test-all coverage smoke performance validate test-docker test-backend-docker

APP_BASE_URL ?= https://raushni-dev.com
API_BASE_URL ?= https://api.raushni-dev.com
CMS_BASE_URL ?= https://cms.raushni-dev.com

help:
	@echo "Raushni development commands"
	@echo "  make dev-hosts              Show command to configure raushni-dev.com local DNS"
	@echo "  make dev-up                 Start local dev stack with .env.dev.example defaults"
	@echo "  make validate               Run static validation"
	@echo "  make push-aws-secrets       Push runtime secrets to AWS Secrets Manager from env"
	@echo "  make test                   Run backend and frontend tests"
	@echo "  make coverage               Generate backend/frontend coverage"
	@echo "  make smoke                  Run URL smoke tests against raushni-dev.com"
	@echo "  make performance            Run lightweight performance smoke"

dev-hosts:
	@echo "Run this once so raushni-dev.com resolves locally:"
	@echo "  sudo ./scripts/setup-dev-hosts.sh"

dev-up:
	docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-down:
	docker compose --env-file .env.dev.example -f docker-compose.yml -f docker-compose.dev.yml down

push-aws-secrets:
	node scripts/push-aws-secrets.mjs

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
	@echo "Running backend tests..."
	mkdir -p reports/backend
	PYTHONPATH=backend pytest tests/backend -v --cov=app --cov-report=term-missing --cov-report=html:reports/backend/htmlcov --cov-report=xml:reports/backend/coverage.xml --junitxml=reports/backend/junit.xml

test-backend-unit:
	mkdir -p reports/backend
	PYTHONPATH=backend pytest tests/backend -m unit -v --cov=app --cov-report=term-missing

test-backend-integration:
	mkdir -p reports/backend
	PYTHONPATH=backend pytest tests/backend -m "integration or e2e" -v --cov=app --cov-report=term-missing

# Run frontend tests
test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm run test:ci

# Run E2E tests
test-e2e:
	@echo "Running E2E tests..."
	docker-compose -f tests/docker/docker-compose.test.yml up --abort-on-container-exit

# Run all tests with coverage
test-all: test-backend test-frontend test-e2e

# Generate coverage reports
coverage:
	@echo "Generating coverage reports..."
	mkdir -p reports/backend
	PYTHONPATH=backend pytest tests/backend -v --cov=app --cov-report=term-missing --cov-report=html:reports/backend/htmlcov --cov-report=xml:reports/backend/coverage.xml --junitxml=reports/backend/junit.xml
	cd frontend && npm run test:coverage
	@echo "Coverage reports available in:"
	@echo "  - reports/backend/htmlcov/index.html"
	@echo "  - frontend/coverage/index.html"

smoke:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) CMS_BASE_URL=$(CMS_BASE_URL) node scripts/smoke-test.mjs

performance:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) node scripts/performance-smoke.mjs

validate:
	npm --prefix frontend run type-check
	ruby -e 'require "yaml"; Dir["k8s/**/*.yaml"].sort.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }'
	kubectl kustomize k8s >/tmp/raushni-kustomize.yaml
	kubectl kustomize k8s/external-secrets >/tmp/raushni-external-secrets.yaml
	kubectl kustomize k8s/external-secret-store >/tmp/raushni-external-secret-store.yaml
	docker compose config --quiet
	sh nginx/scripts/test-nginx.sh

# Run tests in Docker
test-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit

# Run only backend tests in Docker and keep reports in the test volume.
test-backend-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
