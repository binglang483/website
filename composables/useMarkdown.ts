import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
})

/** 剥离 onXXX 事件属性（带引号或不带引号） */
function stripEventAttrs(html: string): string {
  // 匹配 onXXX=... 三种形式：双引号、单引号、无引号
  return html.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

/** 服务端安全渲染：marked + 正则剥离危险标签/属性 */
export function renderMarkdownSafe(raw: string): string {
  if (!raw) return ''
  let html = marked.parse(raw) as string
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/<link[\s\S]*?<\/link>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  html = stripEventAttrs(html)
  return html
}

/** 客户端 composable：marked + DOMPurify */
export function useMarkdown() {
  function render(raw: string): string {
    if (!raw) return ''
    const html = marked.parse(raw) as string
    if (typeof window !== 'undefined') {
      try {
        const DOMPurify = require('dompurify')
        return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
      } catch {
        return renderMarkdownSafe(raw)
      }
    }
    return renderMarkdownSafe(raw)
  }
  return { render }
}
