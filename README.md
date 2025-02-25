Install Git Bash
bash <name.sh>

```
cd asr-service && docker build -t asr-service:latest .
docker tag asr-service:latest myrepo/asr-service:latest
docker push myrepo/asr-service:latest
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/asr-deployment.yaml
kubectl apply -f k8s/asr-hpa.yaml
kubectl apply -f k8s/envoy.yaml
```

```
docker build -t myrepo/asr-service:latest .
kubectl rollout restart deployment asr-service
(or)
kubectl rollout restart deployment asr-service
```

```
kubectl get pods
kubectl logs -f deployment/asr-service
```

```
kubectl apply -f k8s/
```