/**
 * 统一 API 响应格式
 * 约定：code=0 成功, code≠0 失败；HTTP status 始终 200（由前端按 code 处理）
 */

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}

/** 成功响应 */
export function ok<T>(data: T | null = null, message = 'ok'): ApiResponse<T> {
  return { code: 200, message, data }
}

/** 业务错误（前端按 code !== 0 处理） */
export function err<T = null>(message: string, code = 400): ApiResponse<T> {
  return { code, message, data: null }
}

/** 快捷构造：400 参数错误 */
export function badRequest(msg: string) { return err(msg, 400) }
/** 快捷构造：401 未登录 */
export function unauthorized(msg = '请先登录') { return err(msg, 401) }
/** 快捷构造：403 无权限 */
export function forbidden(msg = '无权限操作') { return err(msg, 403) }
/** 快捷构造：404 不存在 */
export function notFound(msg = '资源不存在') { return err(msg, 404) }
/** 快捷构造：500 内部错误 */
export function serverError(msg = '服务器内部错误') { return err(msg, 500) }
