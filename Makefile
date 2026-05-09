.PHONY: test test-backend test-frontend test-e2e test-all coverage

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
	@echo "Running backend tests..."
	mkdir -p reports/backend
	PYTHONPATH=backend pytest tests/backend -v --cov=backend/app --cov-report=term-missing --cov-report=html:reports/backend/htmlcov --cov-report=xml:reports/backend/coverage.xml --junitxml=reports/backend/junit.xml

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
	cd backend && pytest tests/ --cov=app --cov-report=html
	cd frontend && npm run test:coverage
	@echo "Coverage reports available in:"
	@echo "  - backend/htmlcov/index.html"
	@echo "  - frontend/coverage/index.html"

# Run tests in Docker
test-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit

# Run only backend tests in Docker and keep reports in the test volume.
test-backend-docker:
	docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
