.PHONY: help dev-hosts dev-up dev-down push-aws-secrets test test-backend test-backend-unit test-backend-integration test-frontend test-e2e test-all coverage smoke link-check crud-smoke performance validate k8s-validate k8s-local-check k8s-local-install-ingress k8s-local-hosts k8s-local-secret k8s-local-build k8s-local-deploy k8s-local-seed-cms k8s-local-stop k8s-local-start k8s-local-clean k8s-local-clean-cache k8s-local-deep-clean k8s-local-status k8s-local-smoke k8s-local-crud-smoke k8s-deploy-nonprod k8s-deploy-dashboard k8s-dashboard-token k8s-dashboard-admin-token k8s-dashboard-port-forward test-docker test-backend-docker

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
	@echo "  make crud-smoke             Run dashboard CRUD smoke tests"
	@echo "  make link-check             Crawl and verify public/internal links"
	@echo "  make performance            Run lightweight performance smoke"
	@echo "  make k8s-validate           Render production, nonprod, and dashboard K8s manifests"
	@echo "  make k8s-deploy-nonprod     Deploy production-like nonprod overlay"
	@echo "  make k8s-deploy-dashboard   Deploy Kubernetes Dashboard add-on"
	@echo "  make k8s-dashboard-token    Print dashboard viewer token"
	@echo "  make k8s-dashboard-admin-token Print dashboard admin token for local/dev"
	@echo "  make k8s-local-deploy       Deploy one-node local K8s overlay"
	@echo "  make k8s-local-seed-cms     Seed Strapi CMS content and public permissions"
	@echo "  make k8s-local-stop         Scale app workloads to zero"
	@echo "  make k8s-local-status       Show local K8s pods, services, ingress, dashboard"
	@echo "  make k8s-local-smoke        Run smoke/link checks through raushni-dev.com"
	@echo "  make k8s-local-crud-smoke   Run dashboard CRUD smoke tests through K8s"
	@echo "  make k8s-local-clean-cache  Clean repo caches and Docker build cache"
	@echo "  YES=true make k8s-local-deep-clean  Prune unused Docker data and volumes"

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

crud-smoke:
	API_BASE_URL=$(API_BASE_URL) node scripts/dashboard-crud-smoke.mjs

link-check:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) CMS_BASE_URL=$(CMS_BASE_URL) node scripts/link-check.mjs

performance:
	APP_BASE_URL=$(APP_BASE_URL) API_BASE_URL=$(API_BASE_URL) node scripts/performance-smoke.mjs

validate:
	npm --prefix frontend run type-check
	ruby -e 'require "yaml"; Dir["k8s/**/*.yaml"].sort.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }'
	kubectl kustomize k8s >/tmp/raushni-kustomize.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/local-min >/tmp/raushni-local-min.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod >/tmp/raushni-nonprod.yaml
	kubectl kustomize k8s/addons/kubernetes-dashboard >/tmp/raushni-dashboard.yaml
	kubectl kustomize k8s/external-secrets >/tmp/raushni-external-secrets.yaml
	kubectl kustomize k8s/external-secret-store >/tmp/raushni-external-secret-store.yaml
	docker compose config --quiet
	sh nginx/scripts/test-nginx.sh

k8s-validate:
	ruby -e 'require "yaml"; Dir["k8s/**/*.yaml"].sort.each { |f| YAML.load_stream(File.read(f)); puts "OK #{f}" }'
	kubectl kustomize k8s >/tmp/raushni-kustomize.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/local-min >/tmp/raushni-local-min.yaml
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod >/tmp/raushni-nonprod.yaml
	kubectl kustomize k8s/addons/kubernetes-dashboard >/tmp/raushni-dashboard.yaml

k8s-local-check:
	scripts/raushni-k8s-dev.sh check

k8s-local-install-ingress:
	scripts/raushni-k8s-dev.sh install-ingress

k8s-local-hosts:
	scripts/raushni-k8s-dev.sh hosts

k8s-local-secret:
	scripts/raushni-k8s-dev.sh secret

k8s-local-build:
	scripts/raushni-k8s-dev.sh build

k8s-local-deploy:
	scripts/raushni-k8s-dev.sh deploy

k8s-local-seed-cms:
	scripts/raushni-k8s-dev.sh seed-cms

k8s-local-stop:
	scripts/raushni-k8s-dev.sh stop

k8s-local-start:
	scripts/raushni-k8s-dev.sh start

k8s-local-clean:
	scripts/raushni-k8s-dev.sh clean

k8s-local-clean-cache:
	scripts/raushni-k8s-dev.sh clean-cache

k8s-local-deep-clean:
	YES=true scripts/raushni-k8s-dev.sh deep-clean

k8s-local-status:
	scripts/raushni-k8s-dev.sh status

k8s-local-smoke:
	scripts/raushni-k8s-dev.sh smoke

k8s-local-crud-smoke:
	NODE_TLS_REJECT_UNAUTHORIZED=0 API_BASE_URL=$(API_BASE_URL) node scripts/dashboard-crud-smoke.mjs

k8s-deploy-nonprod:
	kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod | kubectl apply -f -

k8s-deploy-dashboard:
	kubectl apply -k k8s/addons/kubernetes-dashboard

k8s-dashboard-token:
	kubectl -n kubernetes-dashboard get secret raushni-dashboard-viewer-token -o jsonpath='{.data.token}' | base64 --decode
	@echo

k8s-dashboard-admin-token:
	kubectl -n kubernetes-dashboard create token raushni-dashboard-admin --duration=12h

k8s-dashboard-port-forward:
	kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard 10443:443

# Run tests in Docker
test-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit

# Run only backend tests in Docker and keep reports in the test volume.
test-backend-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
