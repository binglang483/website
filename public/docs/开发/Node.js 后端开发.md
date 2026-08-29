# Node.js 后端开发

> 从 Hello World 到生产级服务端应用

## Node.js 运行时

### 事件循环

```
timers → pending → poll → check → close → timers...
                    ↑
                  (主要 IO 事件在这里)
```

### 常用内置模块

| 模块 | 用途 |
|------|------|
| fs | 文件系统 |
| path | 路径处理 |
| crypto | 加密哈希 |
| stream | 流式处理 |

## 框架选择

### Express — 经典稳重

```js
import express from 'express'
const app = express()
app.use(express.json())
app.get('/api/users', async (req, res) => {
  const users = await db.users.findAll()
  res.json({ code: 200, data: users })
})
app.listen(3000)
```

### Fastify — 极速性能

```js
import Fastify from 'fastify'
const fastify = Fastify({ logger: true })
fastify.get('/health', async () => ({ status: 'ok' }))
fastify.listen({ port: 3000 })
```

## API 设计规范

RESTful 统一响应格式：

```json
{ "code": 200, "message": "ok", "data": { } }
```

## 数据库集成

### Prisma ORM

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}
```

## 生产部署

PM2 + Docker + 反向代理 Nginx 是经典组合。
