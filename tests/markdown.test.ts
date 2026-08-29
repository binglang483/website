import { describe, it, expect } from 'vitest'

/** 测试 Markdown 安全渲染（XSS 防注入） */
describe('markdown safe render (node)', () => {
  it('正常 markdown 正常渲染', async () => {
    const { renderMarkdownSafe } = await import('~/composables/useMarkdown')
    const html = renderMarkdownSafe('# 标题\n\n**加粗**')
    expect(html).toContain('<h1>')
    expect(html).toContain('<strong>')
  })

  it('script 标签被剥离', async () => {
    const { renderMarkdownSafe } = await import('~/composables/useMarkdown')
    const html = renderMarkdownSafe('# 标题\n\n<script>alert(1)</script>')
    expect(html).not.toContain('script')
    expect(html).not.toContain('alert')
  })

  it('onXXX 事件属性被剥离', async () => {
    const { renderMarkdownSafe } = await import('~/composables/useMarkdown')
    const html = renderMarkdownSafe('hello\n\n<img src=x onerror=alert(1)>')
    expect(html).not.toMatch(/onerror|onclick|onload/i)
  })

  it('iframe/object/embed 被剥离', async () => {
    const { renderMarkdownSafe } = await import('~/composables/useMarkdown')
    const html = renderMarkdownSafe('<iframe src="evil"></iframe>')
    expect(html).not.toContain('iframe')
  })

  it('空内容返回空串', async () => {
    const { renderMarkdownSafe } = await import('~/composables/useMarkdown')
    expect(renderMarkdownSafe('')).toBe('')
    expect(renderMarkdownSafe(undefined as any)).toBe('')
  })
})
