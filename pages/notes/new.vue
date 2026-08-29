<template>
  <div>
    <NuxtLink to="/notes" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回笔记</NuxtLink>

    <div class="card p-6">
      <h1 class="text-2xl font-bold mb-5 flex items-center gap-2">📝 新建笔记</h1>

      <!-- 标题 + 领域选择 -->
      <div class="space-y-3 mb-5">
        <input v-model="form.title" type="text" placeholder="笔记标题..." class="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-sakura-400 outline-none py-2 bg-transparent" />

        <div class="flex flex-wrap items-center gap-3">
          <select v-model="form.domain" @change="form.subcategory = ''" class="input flex-1 min-w-[140px]">
            <option value="">选择领域</option>
            <option v-for="d in domains" :key="d" :value="d">{{ iconMap[d] }} {{ d }}</option>
          </select>
          <select v-model="form.subcategory" class="input flex-1 min-w-[140px]" :disabled="!form.domain">
            <option value="">选择子分类</option>
            <option v-for="s in availableSubs" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="selectedTemplate" class="input min-w-[140px]">
            <option value="">📋 选择模板</option>
            <option v-for="t in templates" :key="t.key" :value="t.key">{{ t.name }}</option>
          </select>
        </div>
      </div>

      <!-- 左右分栏：编辑 + 实时预览 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 左边：编辑 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">✏️ 编辑</span>
            <span class="text-xs text-gray-400">{{ form.content.length }} 字符</span>
          </div>
          <div class="border-2 border-sakura-100 rounded-xl overflow-hidden">
            <textarea
              v-model="form.content"
              placeholder="# 笔记标题&#10;&#10;在这里记录你的想法...&#10;&#10;支持 **Markdown** 语法"
              class="w-full p-4 outline-none font-mono text-sm leading-relaxed min-h-[480px] resize-y"
            ></textarea>
          </div>
        </div>

        <!-- 右边：实时预览 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">👁️ 预览</span>
            <span class="text-xs text-gray-400">实时渲染</span>
          </div>
          <div class="border-2 border-gray-100 rounded-xl min-h-[480px] max-h-[600px] overflow-y-auto bg-white">
            <div v-if="form.content" class="markdown-body p-4" v-html="rendered"></div>
            <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
              左侧开始写，这里会实时预览 ✨
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <NuxtLink to="/notes" class="btn-ghost">取消</NuxtLink>
        <button
          @click="submit"
          :disabled="!canSubmit || submitting"
          class="btn-primary disabled:opacity-50"
        >{{ submitting ? '保存中...' : '🌸 保存笔记' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMarkdown } from '~/composables/useMarkdown'
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const { render } = useMarkdown()
const { domainNames, getSubcategories, iconMap } = useDomains()
const form = reactive({ title: '', content: '', domain: '', subcategory: '' })
const submitting = ref(false)
const selectedTemplate = ref('')
const rendered = computed(() => render(form.content || ''))

const domains = domainNames
const availableSubs = computed(() => getSubcategories(form.domain))

const canSubmit = computed(() => form.title.trim() && form.content.trim() && form.domain && form.subcategory)

// Markdown 模板
const templates = [
  {
    key: 'tech', name: '💻 技术笔记',
    content: `# 技术笔记：主题名称

## 📌 概述
简要描述这个技术点是什么、为什么要掌握它。

## 🔧 核心概念
- 概念 A：解释
- 概念 B：解释

## 💡 实践示例

\`\`\`js
// 代码示例
console.log('Hello World')
\`\`\`

## 📚 参考资料
- [资料名](链接)

---
*记录时间：${new Date().toLocaleString('zh-CN')}*`
  },
  {
    key: 'reading', name: '📖 读书笔记',
    content: `# 《书名》读书笔记

## 👤 作者
作者简介

## 📖 内容概要
这本书主要讲了什么...

## 💡 核心观点
### 观点一
### 观点二
### 观点三

## 🔖 精彩摘录
> "引用一段话"

## 🤔 我的思考
读完后我的感想...

---
*记录时间：${new Date().toLocaleString('zh-CN')}*`
  },
  {
    key: 'meeting', name: '📅 会议纪要',
    content: `# 会议纪要

**时间**：${new Date().toLocaleString('zh-CN')}
**地点**：线上 / XX 会议室
**参与人**：张三、李四、王五

## 📋 议题
1. 议题一
2. 议题二

## 💬 讨论要点
- 张三：发言内容
- 李四：发言内容

## ✅ 决议
1. 决议一 — 负责人
2. 决议二 — 负责人

## 📌 待办事项
| 事项 | 负责人 | 截止日期 |
|---|---|---|
| 任务一 | 张三 | xx-xx |
| 任务二 | 李四 | xx-xx |`
  },
  {
    key: 'idea', name: '💡 灵感备忘',
    content: `# 💡 灵感记录

**时间**：${new Date().toLocaleString('zh-CN')}
**来源**：（偶然想到 / 看到什么触发的）

## 灵感内容
在这里快速写下你的想法...

## 🤔 延伸思考
这个想法可以怎么发展？有什么障碍？

## 🎯 下一步行动
- [ ] 行动一
- [ ] 行动二
- [ ] 进一步研究`
  },
  {
    key: 'blank', name: '📝 空白',
    content: ''
  },
]

// 选中模板时自动填充
watch(selectedTemplate, (key) => {
  if (!key) return
  const t = templates.find(x => x.key === key)
  if (t && t.content) {
    form.content = t.content
    if (!form.title) form.title = t.name.replace(/^[^\s]+\s/, '') || '新笔记'
  }
  selectedTemplate.value = ''  // 复位，避免重复触发
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const res = await useApi<any>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.code === 200) {
      router.push(`/notes/${res.data.slug}`)
    } else {
      alert(res.message)
    }
  } catch (e: any) {
    alert('保存失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>
