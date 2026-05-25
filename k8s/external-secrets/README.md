# External Secrets Operator

This overlay prepares the `external-secrets` service account for AWS IAM Roles for Service Accounts (IRSA).

Patch `serviceaccount.yaml` with the Terraform output `external_secrets_role_arn`, then create the namespace and service account:

```bash
kubectl apply -k k8s/external-secrets
```

Install the operator against that service account:

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm repo update
helm upgrade --install external-secrets external-secrets/external-secrets \
  --namespace external-secrets \
  --create-namespace \
  --set installCRDs=true \
  --set serviceAccount.create=false \
  --set serviceAccount.name=external-secrets
```

The main `k8s/secrets.yaml` manifest uses this service account through `ClusterSecretStore` to create the runtime Kubernetes Secret named `raushni-secrets`.

After the Helm install completes, apply `k8s/external-secret-store` to create the cluster-scoped AWS Secrets Manager store.
