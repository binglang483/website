# Docker 容器技术

> 轻量 · 快速 · 一致 — 从入门到生产级容器化

## 容器 vs 虚拟机

容器共享 Host Kernel，秒级启动，MB 级体积；VM 有独立 Guest OS，分钟级启动，GB 级体积。

## 核心原理

Namespaces（隔离 PID/Network/Mount）+ Cgroups（限制 CPU/内存）

## Dockerfile 多阶段构建

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./ && RUN npm ci
COPY . . && RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## Docker Compose

多服务编排：`docker compose up -d`、`docker compose down`、`docker compose logs -f app`

## 网络模式

bridge（默认）、host（共享宿主机网络）、overlay（跨主机）

## 数据持久化

Volume（Docker 管理，推荐）、Bind Mount（指定宿主机路径）

## 生产要点

- 用非 root 用户运行（USER app）
- distroless 基础镜像减小体积
- HEALTHCHECK 健康检查
- log-opt 限制日志体积
