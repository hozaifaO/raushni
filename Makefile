.PHONY: help dev-hosts dev-up dev-down push-aws-secrets test test-backend test-backend-unit test-backend-integration test-frontend test-e2e test-all coverage smoke link-check performance validate k8s-validate k8s-deploy-nonprod k8s-deploy-dashboard k8s-dashboard-token k8s-dashboard-port-forward test-docker test-backend-docker

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
	@echo "  make link-check             Crawl and verify public/internal links"
	@echo "  make performance            Run lightweight performance smoke"
	@echo "  make k8s-validate           Render production, nonprod, and dashboard K8s manifests"
	@echo "  make k8s-deploy-nonprod     Deploy production-like nonprod overlay"
	@echo "  make k8s-deploy-dashboard   Deploy Kubernetes Dashboard add-on"
	@echo "  make k8s-dashboard-token    Print dashboard viewer token"

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

link-check:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) CMS_BASE_URL=$(CMS_BASE_URL) node scripts/link-check.mjs

performance:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) node scripts/performance-smoke.mjs

validate:
	npm --prefix frontend run type-check
	ruby -e 'require "yaml"; Dir["k8s/**/*.yaml"].sort.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }'
	kubectl kustomize k8s >/tmp/raushni-kustomize.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod >/tmp/raushni-nonprod.yaml
	kubectl kustomize k8s/addons/kubernetes-dashboard >/tmp/raushni-dashboard.yaml
	kubectl kustomize k8s/external-secrets >/tmp/raushni-external-secrets.yaml
	kubectl kustomize k8s/external-secret-store >/tmp/raushni-external-secret-store.yaml
	docker compose config --quiet
	sh nginx/scripts/test-nginx.sh

k8s-validate:
	ruby -e 'require "yaml"; Dir["k8s/**/*.yaml"].sort.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }'
	kubectl kustomize k8s >/tmp/raushni-kustomize.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod >/tmp/raushni-nonprod.yaml
	kubectl kustomize k8s/addons/kubernetes-dashboard >/tmp/raushni-dashboard.yaml

k8s-deploy-nonprod:
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod | kubectl apply -f -

k8s-deploy-dashboard:
	kubectl apply -k k8s/addons/kubernetes-dashboard

k8s-dashboard-token:
	kubectl -n kubernetes-dashboard get secret raushni-dashboard-viewer-token -o jsonpath='{.data.token}' | base64 --decode
	@echo

k8s-dashboard-port-forward:
	kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard 10443:443

# Run tests in Docker
test-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit

# Run only backend tests in Docker and keep reports in the test volume.
test-backend-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
