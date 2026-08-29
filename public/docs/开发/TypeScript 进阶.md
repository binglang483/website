# TypeScript 进阶

> 类型体操 · 泛型编程 · 类型安全的大型应用开发

## 类型系统基础

### 联合类型与字面量

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error'

interface User {
  id: number
  name: string
  role: 'admin' | 'user' | 'guest'
  email?: string
}
```

### 模板字面量类型

```typescript
type Color = `#${string}`
type EventName<T extends string> = `on${Capitalize<T>}`
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type API = `${Uppercase<HTTPMethod>} /api/${string}`
const url: API = 'GET /api/users'  // ✅
```

## 泛型编程

### 泛型函数和接口

```typescript
function identity<T>(arg: T): T { return arg }

interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>
  save(entity: T): Promise<T>
  delete(id: ID): Promise<boolean>
}
```

### 条件类型

```typescript
type IsString<T> = T extends string ? true : false
type Result<T> = T extends Promise<infer U> ? U : T
type NonNullable<T> = T extends null | undefined ? never : T
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> } : T
```

### 映射类型

```typescript
type Readonly<T> = { readonly [K in keyof T]: T[K] }
type Partial<T> = { [K in keyof T]?: T[K] }
type Pick<T, K extends keyof T> = { [P in K]: T[P] }
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
```

## 类型体操实战

### 类型安全的事件总线

```typescript
interface Events {
  login: { userId: number; username: string }
  logout: void
  error: { code: number; message: string }
}

class TypedEventBus {
  private handlers: Partial<Record<keyof Events, Set<Function>>> = {}
  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    if (!this.handlers[event]) this.handlers[event] = new Set()
    this.handlers[event]!.add(handler)
  }
  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.handlers[event]?.forEach(h => h(payload))
  }
}
```

## 类型收窄技巧

### 判别联合类型

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value
  throw new Error(result.error)
}
```

### satisfies 操作符

```typescript
const routes = {
  home: '/',
  about: '/about',
} satisfies Record<string, `/${string}`>
// routes.home 类型是 '/'，不是 string
```
