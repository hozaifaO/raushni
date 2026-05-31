#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="${NAMESPACE:-raushni}"
DASHBOARD_NAMESPACE="${DASHBOARD_NAMESPACE:-kubernetes-dashboard}"
OVERLAY="${OVERLAY:-k8s/overlays/local-min}"
IMAGE_TAG="${IMAGE_TAG:-1.0.0}"
YES="${YES:-false}"

usage() {
  cat <<'USAGE'
Raushni local/minimum Kubernetes operations

Usage:
  scripts/raushni-k8s-dev.sh <command>

Commands:
  check                 Show local tool and cluster status
  install-ingress       Install ingress-nginx using kubectl manifest
  hosts                 Add raushni-dev.com host entries to /etc/hosts
  secret                Create/update local raushni-secrets in Kubernetes
  build                 Build Raushni app images for the current Docker/K8s runtime
  deploy                Validate and deploy the local-min one-node overlay
  stop                  Scale app workloads to zero but keep data volumes and namespace
  start                 Scale app workloads back to one replica
  clean                 Delete Raushni app resources and dashboard, keep Docker images
  clean-cache           Clean project caches and safe Docker build cache
  deep-clean            Clean project caches and prune unused Docker data (requires YES=true)
  dashboard-deploy      Deploy Kubernetes Dashboard
  dashboard-token       Print a 12h Dashboard admin token
  dashboard-open        Port-forward Dashboard on https://127.0.0.1:10443
  status                Show pods, services, ingress, and dashboard status
  smoke                 Run smoke and link checks through local raushni-dev.com

Environment:
  OVERLAY=k8s/overlays/local-min
  IMAGE_TAG=1.0.0
  YES=true              Required for deep-clean
USAGE
}

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

confirm_deep_clean() {
  if [ "$YES" != "true" ]; then
    echo "Refusing deep-clean without YES=true. This protects Docker volumes/images from accidental pruning." >&2
    echo "Run: YES=true scripts/raushni-k8s-dev.sh deep-clean" >&2
    exit 1
  fi
}

check() {
  need docker
  need kubectl
  echo "Docker: $(docker --version)"
  echo "Kubectl: $(kubectl version --client=true | head -n 1)"
  echo "Context: $(kubectl config current-context 2>/dev/null || true)"
  kubectl get nodes -o wide || true
}

install_ingress() {
  need kubectl
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml
  kubectl -n ingress-nginx rollout status deploy/ingress-nginx-controller --timeout=240s
}

hosts() {
  cat <<'HOSTS' | sudo tee -a /etc/hosts >/dev/null
127.0.0.1 raushni-dev.com
127.0.0.1 www.raushni-dev.com
127.0.0.1 api.raushni-dev.com
127.0.0.1 cms.raushni-dev.com
HOSTS
  echo "Added local raushni-dev.com entries to /etc/hosts"
}

secret() {
  need kubectl
  kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
  kubectl -n "$NAMESPACE" create secret generic raushni-secrets \
    --from-literal=POSTGRES_USER="${POSTGRES_USER:-raushni_admin}" \
    --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-ChangeMe@12345}" \
    --from-literal=BACKEND_DATABASE_URL="${BACKEND_DATABASE_URL:-postgresql+asyncpg://raushni_admin:ChangeMe@12345@postgres:5432/raushni_backend}" \
    --from-literal=CMS_DATABASE_NAME="${CMS_DATABASE_NAME:-raushni_cms}" \
    --from-literal=CMS_DATABASE_USERNAME="${CMS_DATABASE_USERNAME:-raushni_admin}" \
    --from-literal=CMS_DATABASE_PASSWORD="${CMS_DATABASE_PASSWORD:-ChangeMe@12345}" \
    --from-literal=REDIS_PASSWORD="${REDIS_PASSWORD:-ChangeMe@12345}" \
    --from-literal=REDIS_URL="${REDIS_URL:-redis://:ChangeMe@12345@redis:6379}" \
    --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-ChangeMeNextAuthSecret123456789}" \
    --from-literal=NEXTAUTH_ADMIN_EMAIL="${NEXTAUTH_ADMIN_EMAIL:-admin@raushni.com}" \
    --from-literal=NEXTAUTH_ADMIN_PASSWORD="${NEXTAUTH_ADMIN_PASSWORD:-ChangeMe@12345}" \
    --from-literal=NEXTAUTH_STAFF_EMAIL="${NEXTAUTH_STAFF_EMAIL:-staff@raushni.com}" \
    --from-literal=NEXTAUTH_STAFF_PASSWORD="${NEXTAUTH_STAFF_PASSWORD:-ChangeMe@12345}" \
    --from-literal=STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_change_me}" \
    --from-literal=STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY:-pk_test_change_me}" \
    --from-literal=STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-whsec_change_me}" \
    --from-literal=STRAPI_APP_KEYS="${STRAPI_APP_KEYS:-key1,key2,key3,key4}" \
    --from-literal=STRAPI_API_TOKEN_SALT="${STRAPI_API_TOKEN_SALT:-ChangeMeApiTokenSalt}" \
    --from-literal=STRAPI_ADMIN_JWT_SECRET="${STRAPI_ADMIN_JWT_SECRET:-ChangeMeAdminJwtSecret}" \
    --from-literal=STRAPI_JWT_SECRET="${STRAPI_JWT_SECRET:-ChangeMeJwtSecret}" \
    --from-literal=STRAPI_TRANSFER_TOKEN_SALT="${STRAPI_TRANSFER_TOKEN_SALT:-ChangeMeTransferSalt}" \
    --from-literal=DD_API_KEY="${DD_API_KEY:-change-me}" \
    --dry-run=client -o yaml | kubectl apply -f -
}

build() {
  need docker
  docker build -t "ghcr.io/owais4u/raushni-backend:${IMAGE_TAG}" "$ROOT_DIR/backend"
  docker tag "ghcr.io/owais4u/raushni-backend:${IMAGE_TAG}" "raushni-backend:local"
  docker build -t "ghcr.io/owais4u/raushni-frontend:${IMAGE_TAG}" "$ROOT_DIR/frontend"
  docker tag "ghcr.io/owais4u/raushni-frontend:${IMAGE_TAG}" "raushni-frontend:local"
  docker build -t "ghcr.io/owais4u/raushni-cms:${IMAGE_TAG}" "$ROOT_DIR/cms"
  docker tag "ghcr.io/owais4u/raushni-cms:${IMAGE_TAG}" "raushni-cms:local"
  docker build -t "ghcr.io/owais4u/raushni-document-generator:${IMAGE_TAG}" "$ROOT_DIR/services/document_generator"
  docker tag "ghcr.io/owais4u/raushni-document-generator:${IMAGE_TAG}" "raushni-document-generator:local"

  if docker ps --format '{{.Names}}' | grep -qx 'desktop-control-plane'; then
    docker save \
      raushni-backend:local \
      raushni-frontend:local \
      raushni-cms:local \
      raushni-document-generator:local \
      | docker exec -i desktop-control-plane ctr -n k8s.io images import -
  fi
}

deploy() {
  need kubectl
  cd "$ROOT_DIR"
  secret
  kubectl -n "$NAMESPACE" delete hpa backend frontend --ignore-not-found
  kubectl -n "$NAMESPACE" delete pdb backend frontend document-generator --ignore-not-found
  kubectl kustomize --load-restrictor LoadRestrictionsNone "$OVERLAY" | kubectl apply -f -
  kubectl -n "$NAMESPACE" rollout status statefulset/postgres --timeout=240s
  kubectl -n "$NAMESPACE" rollout status statefulset/redis --timeout=180s
  kubectl -n "$NAMESPACE" rollout status deploy/backend --timeout=240s
  kubectl -n "$NAMESPACE" rollout status deploy/frontend --timeout=240s
  kubectl -n "$NAMESPACE" rollout status deploy/strapi --timeout=360s
  kubectl -n "$NAMESPACE" rollout status deploy/document-generator --timeout=240s
}

stop() {
  need kubectl
  kubectl -n "$NAMESPACE" scale deploy/backend --replicas=0 --ignore-not-found
  kubectl -n "$NAMESPACE" scale deploy/frontend --replicas=0 --ignore-not-found
  kubectl -n "$NAMESPACE" scale deploy/strapi --replicas=0 --ignore-not-found
  kubectl -n "$NAMESPACE" scale deploy/document-generator --replicas=0 --ignore-not-found
  echo "Application deployments scaled to zero. Postgres and Redis stateful data remains."
}

start() {
  need kubectl
  kubectl -n "$NAMESPACE" scale deploy/backend --replicas=1
  kubectl -n "$NAMESPACE" scale deploy/frontend --replicas=1
  kubectl -n "$NAMESPACE" scale deploy/strapi --replicas=1
  kubectl -n "$NAMESPACE" scale deploy/document-generator --replicas=1
}

clean() {
  need kubectl
  cd "$ROOT_DIR"
  kubectl delete -k k8s/addons/kubernetes-dashboard --ignore-not-found
  kubectl delete namespace "$NAMESPACE" --ignore-not-found
}

clean_cache() {
  need docker
  cd "$ROOT_DIR"
  rm -rf .next .pytest_cache htmlcov .coverage coverage reports
  rm -rf frontend/.next frontend/coverage frontend/.turbo frontend/tsconfig.tsbuildinfo
  rm -rf backend/.pytest_cache backend/htmlcov backend/.coverage
  rm -rf cms/.cache cms/.tmp cms/build
  docker builder prune -f
}

deep_clean() {
  confirm_deep_clean
  clean_cache
  docker system prune -af
  docker volume prune -f
}

dashboard_deploy() {
  need kubectl
  cd "$ROOT_DIR"
  kubectl apply -k k8s/addons/kubernetes-dashboard
  kubectl -n "$DASHBOARD_NAMESPACE" rollout status deploy/kubernetes-dashboard --timeout=180s
  kubectl -n "$DASHBOARD_NAMESPACE" rollout status deploy/dashboard-metrics-scraper --timeout=180s
}

dashboard_token() {
  need kubectl
  kubectl -n "$DASHBOARD_NAMESPACE" create token raushni-dashboard-admin --duration=12h
}

dashboard_open() {
  need kubectl
  echo "Open: https://127.0.0.1:10443"
  echo "Token: scripts/raushni-k8s-dev.sh dashboard-token"
  kubectl -n "$DASHBOARD_NAMESPACE" port-forward svc/kubernetes-dashboard 10443:443
}

status() {
  need kubectl
  kubectl get nodes -o wide || true
  kubectl -n "$NAMESPACE" get pods,svc,ingress,pvc || true
  kubectl -n "$DASHBOARD_NAMESPACE" get pods,svc || true
}

smoke() {
  need node
  cd "$ROOT_DIR"
  LOCAL_RESOLVE=1 node scripts/smoke-test.mjs
  LOCAL_RESOLVE=1 LINK_CHECK_MAX_PAGES=60 node scripts/link-check.mjs
}

main() {
  case "${1:-}" in
    check) check ;;
    install-ingress) install_ingress ;;
    hosts) hosts ;;
    secret) secret ;;
    build) build ;;
    deploy) deploy ;;
    stop) stop ;;
    start) start ;;
    clean) clean ;;
    clean-cache) clean_cache ;;
    deep-clean) deep_clean ;;
    dashboard-deploy) dashboard_deploy ;;
    dashboard-token) dashboard_token ;;
    dashboard-open) dashboard_open ;;
    status) status ;;
    smoke) smoke ;;
    ""|-h|--help|help) usage ;;
    *) echo "Unknown command: $1" >&2; usage; exit 1 ;;
  esac
}

main "$@"
