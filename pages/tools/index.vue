<template>
  <div class="tools-page">
    <!-- ========== 顶部 Banner ========== -->
    <section class="relative overflow-hidden rounded-lg mb-6" style="background:linear-gradient(135deg,#e8f5e9 0%,#f0fdf4 100%);border:1px solid #eceae4;min-height:260px">
      <!-- 多层渐变背景 -->
      <div class="absolute inset-0" style="background: radial-gradient(ellipse at 20% 0%, rgba(244,114,182,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(168,85,247,0.35) 0%, transparent 55%), linear-gradient(135deg,#fff1f2 0%,#fdf4ff 50%,#f0f9ff 100%) "></div>
      <!-- 装饰性圆形 -->
      <div class="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20" style="background:radial-gradient(circle,#ec4899,#a855f7)"></div>
      <div class="absolute -bottom-16 -left-10 w-60 h-60 rounded-full opacity-15" style="background:radial-gradient(circle,#a855f7,#6366f1)"></div>
      <!-- 噪点纹理 -->
      <div class="absolute inset-0 opacity-[0.03]" :style="{ backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>\')' }"></div>
      <!-- SVG 樱花 -->
      <svg class="absolute top-4 right-12 w-16 h-16 opacity-40" viewBox="0 0 100 100">
        <g fill="#f472b6">
          <ellipse cx="50" cy="15" rx="10" ry="15"/>
          <ellipse cx="85" cy="35" rx="10" ry="15" transform="rotate(72 85 35)"/>
          <ellipse cx="72" cy="75" rx="10" ry="15" transform="rotate(144 72 75)"/>
          <ellipse cx="28" cy="75" rx="10" ry="15" transform="rotate(216 28 75)"/>
          <ellipse cx="15" cy="35" rx="10" ry="15" transform="rotate(288 15 35)"/>
        </g>
        <circle cx="50" cy="50" r="5" fill="#fbbf24"/>
      </svg>

      <div class="relative px-8 py-10 md:px-12 md:py-12">
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-block text-2xl">🛠️</span>
          <span class="text-xs font-semibold tracking-widest px-2.5 py-0.5 rounded-full" style="background:rgba(221,51,51,0.1);color:#dd3333">TOOLBOX</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">开发者 & 创作者工具箱</h1>
        <p class="text-sm md:text-base text-gray-500 max-w-xl">精选常用工具与效率神器 · 免费在线使用 · 无需注册 · 持续更新</p>

        <!-- 搜索框 -->
        <div class="mt-5 flex gap-2 max-w-lg">
          <div class="flex-1 flex items-center px-4 h-11 bg-white/80 backdrop-blur border border-gray-100 rounded-xl shadow-sm">
            <span class="text-gray-400 text-sm">🔎</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索工具（JSON / Cron / Color / Regex...）"
              class="flex-1 ml-2 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 分类 Tab ========== -->
    <div class="flex flex-wrap gap-2 mb-5">
      <button
        @click="activeCat = ''"
        :class="catBtnClass('')"
      >✨ 全部工具</button>
      <button
        v-for="c in categories"
        :key="c.id"
        @click="activeCat = c.id"
        :class="catBtnClass(c.id)"
      >{{ c.icon }} {{ c.name }} <span class="opacity-50">({{ c.tools.length }})</span></button>
    </div>

    <!-- ========== 工具卡片网格 ========== -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" v-if="filteredTools.length">
      <div
        v-for="t in filteredTools"
        :key="t.name"
        class="tool-card card p-5 relative overflow-hidden group"
        @click="openTool(t)"
      >
        <!-- 背景装饰 -->
        <div class="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition" :style="{background: t.color}"></div>

        <div class="relative">
          <div class="flex items-start gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-110"
              :style="{background: t.color + '22'}"
            >{{ t.emoji }}</div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 text-[15px] group-hover:text-[#dd3333] transition flex items-center gap-2">
                {{ t.name }}
                <span v-if="t.isNew" class="text-[10px] px-1.5 py-0.5 rounded text-white font-bold" style="background:linear-gradient(90deg,#f472b6,#a855f7)">NEW</span>
              </h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{{ t.desc }}</p>
            </div>
          </div>

          <!-- 标签 -->
          <div class="flex flex-wrap gap-1 mt-3">
            <span
              v-for="tag in t.tags"
              :key="tag"
              class="text-[10px] px-2 py-0.5 rounded-full"
              style="background:#f3f4f6;color:#6b7280"
            >{{ tag }}</span>
          </div>

          <!-- 底部信息 -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span class="text-[11px] text-gray-400 flex items-center gap-1">
              {{ t.free ? '🟢 免费' : '🔵 Freemium' }}
              <span class="mx-1">·</span>
              {{ t.official ? '官方' : '推荐' }}
            </span>
            <span class="text-xs text-[#dd3333] opacity-0 group-hover:opacity-100 transition">打开 ↗</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div v-else class="card p-16 text-center text-gray-400">
      <p class="text-5xl mb-3">🔍</p>
      <p>没找到匹配的工具，换个关键词试试~</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

interface Tool {
  name: string
  emoji: string
  color: string
  desc: string
  tags: string[]
  url: string
  isNew?: boolean
  free?: boolean
  official?: boolean
  categoryId: string
}

interface ToolCat {
  id: string
  name: string
  icon: string
  tools: Tool[]
}

const searchQuery = ref('')
const activeCat = ref('')

const categories = [
  {
    id: 'dev', name: '开发辅助', icon: '💻',
    tools: [
      { name: 'JSON 格式化', emoji: '📋', color: '#f472b6', desc: '快速格式化、压缩、校验 JSON 数据，支持错误定位', tags: ['格式化', '校验'], url: 'https://jsonlint.com/', categoryId: 'dev', free: true, official: true },
      { name: 'Regex 测试器', emoji: '🎯', color: '#a855f7', desc: '在线正则表达式测试，实时高亮匹配结果与分组', tags: ['正则', '调试'], url: 'https://regex101.com/', categoryId: 'dev', free: true, official: true },
      { name: 'Cron 表达式解析', emoji: '⏰', color: '#6366f1', desc: '看懂 cron 语法，自动生成下 N 次执行时间', tags: ['定时', 'DevOps'], url: 'https://crontab.guru/', categoryId: 'dev', free: true },
      { name: 'JWT 解码', emoji: '🔑', color: '#10b981', desc: '解析 JWT Token 的 Header / Payload / Signature', tags: ['鉴权', 'Web'], url: 'https://jwt.io/', categoryId: 'dev', free: true, official: true },
      { name: 'HTTP Headers', emoji: '📨', color: '#f59e0b', desc: '查看你的请求头、测试 CORS 和 Cookie', tags: ['网络', '调试'], url: 'https://httpbin.org/', categoryId: 'dev', free: true },
      { name: 'Git 分支可视化', emoji: '🌳', color: '#ef4444', desc: '输入 git log 命令，自动生成分支合并图', tags: ['Git', '可视化'], url: 'https://gitgraphjs.com/', categoryId: 'dev', free: true, isNew: true },
    ],
  },
  {
    id: 'design', name: '设计创意', icon: '🎨',
    tools: [
      { name: 'Coolors 配色', emoji: '🌈', color: '#f472b6', desc: '按空格键随机生成好看的配色方案，一键导出', tags: ['配色', '灵感'], url: 'https://coolors.co/', categoryId: 'design', free: true },
      { name: 'Color Hunt', emoji: '🦌', color: '#fb923c', desc: '设计师配色合集，按风格/色系浏览', tags: ['配色', '社区'], url: 'https://colorhunt.co/', categoryId: 'design', free: true },
      { name: 'Remove.bg', emoji: '✂️', color: '#10b981', desc: 'AI 自动抠图，5 秒去除背景，效果惊艳', tags: ['抠图', 'AI'], url: 'https://www.remove.bg/', categoryId: 'design', free: false },
      { name: 'Unsplash', emoji: '📷', color: '#6366f1', desc: '高质量免费图片素材库，可商用', tags: ['素材', '图片'], url: 'https://unsplash.com/', categoryId: 'design', free: true, official: true },
      { name: 'DALL·E 3', emoji: '🖼️', color: '#f472b6', desc: '文字生成图片，描述越详细效果越好', tags: ['AI', '生图'], url: 'https://chatgpt.com/dall-e', categoryId: 'design', free: false, isNew: true },
      { name: 'Excalidraw', emoji: '✏️', color: '#64748b', desc: '手绘风格在线白板，画架构图/原型图超方便', tags: ['画板', '原型'], url: 'https://excalidraw.com/', categoryId: 'design', free: true },
    ],
  },
  {
    id: 'productivity', name: '效率神器', icon: '⚡',
    tools: [
      { name: 'Carbon', emoji: '🖼️', color: '#3b82f6', desc: '代码截图美化器，导出漂亮的社交媒体图片', tags: ['代码', '截图'], url: 'https://carbon.now.sh/', categoryId: 'productivity', free: true },
      { name: 'Markdown 实时预览', emoji: '📝', color: '#10b981', desc: '左写右看，编辑器/笔记利器', tags: ['Markdown'], url: 'https://markdownlivepreview.com/', categoryId: 'productivity', free: true },
      { name: 'QR Code 生成器', emoji: '📱', color: '#f59e0b', desc: '自定义颜色/logo 的 QR Code', tags: ['二维码'], url: 'https://www.qr-code-generator.com/', categoryId: 'productivity', free: true },
      { name: '短链接', emoji: '🔗', color: '#ef4444', desc: '把长链接一键变短，自定义后缀', tags: ['URL'], url: 'https://tinyurl.com/', categoryId: 'productivity', free: true },
      { name: 'VirusTotal 扫描', emoji: '🛡️', color: '#1e293b', desc: '上传文件/URL 扫描 70+ 杀毒引擎', tags: ['安全', '扫描'], url: 'https://www.virustotal.com/', categoryId: 'productivity', free: true },
    ],
  },
  {
    id: 'ai', name: 'AI 助手', icon: '🤖',
    tools: [
      { name: 'ChatGPT', emoji: '💬', color: '#10b981', desc: '通用 AI 对话，写代码/写作/翻译全能', tags: ['对话', '通用'], url: 'https://chatgpt.com/', categoryId: 'ai', free: false, official: true },
      { name: 'Claude', emoji: '🧠', color: '#f59e0b', desc: '长文本理解强，适合分析文档和代码库', tags: ['对话', '长文'], url: 'https://claude.ai/', categoryId: 'ai', free: false },
      { name: 'Perplexity', emoji: '🔍', color: '#a855f7', desc: 'AI 搜索引擎，回答带引用来源', tags: ['搜索', 'AI'], url: 'https://www.perplexity.ai/', categoryId: 'ai', free: false },
      { name: 'GitHub Copilot', emoji: '🧑‍💻', color: '#24292e', desc: 'IDE 内 AI 代码补全，支持 40+ 语言', tags: ['代码', 'IDE'], url: 'https://github.com/features/copilot', categoryId: 'ai', free: false, official: true },
      { name: 'Midjourney', emoji: '🎨', color: '#1e1b4b', desc: 'Discord 机器人生成精美艺术图像', tags: ['AI', '生图'], url: 'https://www.midjourney.com/', categoryId: 'ai', free: false },
    ],
  },
  {
    id: 'util', name: '实用杂项', icon: '🧰',
    tools: [
      { name: 'Base64 编解码', emoji: '🔐', color: '#6366f1', desc: '文本、图片互转 Base64', tags: ['编解码'], url: 'https://www.base64decode.org/', categoryId: 'util', free: true },
      { name: 'URL 编解码', emoji: '🌐', color: '#0ea5e9', desc: 'URL encode/decode，处理特殊字符', tags: ['编码'], url: 'https://www.urlencoder.org/', categoryId: 'util', free: true },
      { name: 'Timestamp 转换', emoji: '🕐', color: '#14b8a6', desc: 'Unix 时间戳 ↔ 人类可读时间 互转', tags: ['时间'], url: 'https://www.unixtimestamp.com/', categoryId: 'util', free: true },
      { name: '单位换算', emoji: '📏', color: '#8b5cf6', desc: '长度/重量/温度/货币 一站式换算', tags: ['换算'], url: 'https://www.unitconverters.net/', categoryId: 'util', free: true },
    ],
  },
]

// 扁平化所有工具
const allTools = computed(() => categories.flatMap(c => c.tools))

// 过滤
const filteredTools = computed(() => {
  const catTools = activeCat.value
    ? categories.find(c => c.id === activeCat.value)?.tools || []
    : allTools.value
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return catTools
  return catTools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.tags.some(tg => tg.toLowerCase().includes(q))
  )
})

function catBtnClass(id: string) {
  const active = activeCat.value === id
  return `px-3 py-1.5 rounded-full text-xs transition ${
    active
      ? 'text-white shadow'
      : 'text-gray-600 hover:bg-gray-100 border border-gray-100'
  }` + (active ? ';background:linear-gradient(135deg,#f472b6,#a855f7)' : '')
}

function openTool(t: Tool) {
  window.open(t.url, '_blank', 'noopener,noreferrer')
}
</script>

<style>
.tools-page { position: relative; }
.tool-card {
  transition: all .25s ease;
  border: 1px solid rgba(229,231,235,.5);
}
.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -10px rgba(244,114,182,.25);
  border-color: rgba(244,114,182,.3);
}
</style>
