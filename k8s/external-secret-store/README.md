# External Secret Store

Apply this overlay after External Secrets Operator CRDs are installed.

```bash
kubectl apply -k k8s/external-secret-store
```

It creates the cluster-scoped AWS Secrets Manager store used by `k8s/secrets.yaml`.
