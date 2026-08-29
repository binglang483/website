import { describe, it, expect } from 'vitest'

/** 测试统一响应格式 */
describe('response utils', () => {
  it('ok() 返回 code=0, data, 默认 message', async () => {
    const { ok } = await import('~/server/utils/response')
    expect(ok()).toEqual({ code: 0, message: 'ok', data: null })
    expect(ok([])).toEqual({ code: 0, message: 'ok', data: [] })
    expect(ok({ id: 1 }, 'done')).toEqual({ code: 0, message: 'done', data: { id: 1 } })
  })

  it('err() 返回自定义 code/message', async () => {
    const { err } = await import('~/server/utils/response')
    expect(err('bad', 400)).toEqual({ code: 400, message: 'bad', data: null })
  })

  it('快捷方法返回正确 code', async () => {
    const { badRequest, unauthorized, forbidden, notFound, serverError } = await import('~/server/utils/response')
    expect(badRequest('x').code).toBe(400)
    expect(unauthorized().code).toBe(401)
    expect(forbidden().code).toBe(403)
    expect(notFound().code).toBe(404)
    expect(serverError().code).toBe(500)
  })
})
