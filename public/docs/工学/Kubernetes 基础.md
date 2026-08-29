# Kubernetes 基础

> 容器编排之王 — 自动化部署、扩缩、管理

## 核心概念

| 对象 | 作用 |
|------|------|
| Pod | 最小调度单位，含一或多容器 |
| Deployment | 声明式管理 Pod 副本 |
| Service | 稳定访问入口（LB）|
| ConfigMap/Secret | 配置/密钥 |
| Ingress | HTTP 路由 |
| HPA | 自动水平扩缩 |
| PersistentVolume | 持久存储 |

## 典型工作流

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector: { matchLabels: { app: myapp } }
  template:
    metadata: { labels: { app: myapp } }
    spec:
      containers:
        - name: app
          image: myapp:v1.0
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { memory: "128Mi", cpu: "100m" }
            limits: { memory: "512Mi", cpu: "500m" }
---
apiVersion: v1
kind: Service
metadata: { name: myapp-svc }
spec:
  selector: { app: myapp }
  ports: [{ port: 80, targetPort: 3000 }]
```

## 常用命令

`kubectl get pods/svc/deploy`、`kubectl logs -f POD`、`kubectl exec -it POD -- sh`、`kubectl apply -f file.yaml`
