<template>
  <div>
    <NuxtLink to="/blog" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回博客列表</NuxtLink>

    <div class="card p-6">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">✍️ 写文章</h1>

      <div class="space-y-4">
        <input
          v-model="form.title"
          type="text"
          placeholder="标题是什么呢？"
          class="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-sakura-400 outline-none py-2 bg-transparent transition"
        />

        <div class="flex flex-wrap gap-3 items-center">
          <select v-model="form.category" class="input !w-auto">
            <option value="">选择分类</option>
            <option v-for="d in domains" :key="d" :value="d">{{ getDomainIcon(d) }} {{ d }}</option>
          </select>

          <select v-model="form.visibility" class="input !w-auto">
            <option value="public">🌐 公开</option>
            <option value="private">🔒 仅自己可见</option>
          </select>
        </div>

        <!-- Markdown 编辑器（左右分栏） -->
        <div class="border-2 border-sakura-100 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div class="flex flex-col border-r border-sakura-100">
            <div class="px-4 py-2 bg-sakura-50 text-xs font-medium text-sakura-700 flex items-center justify-between">
              <span>📝 Markdown 编辑</span>
              <button @click="handlePasteFromClipboard" class="text-xs text-sakura-500 hover:text-sakura-700">📋 粘贴图片</button>
            </div>
            <textarea
              v-model="form.content"
              placeholder="# 标题&#10;&#10;开始书写你的想法吧...🌸&#10;&#10;支持 Markdown 格式"
              class="flex-1 p-4 outline-none font-mono text-sm leading-relaxed min-h-[400px] resize-y"
            ></textarea>
          </div>

          <div class="flex flex-col bg-white">
            <div class="px-4 py-2 bg-purple-50 text-xs font-medium text-purple-700">👁️ 实时预览</div>
            <div class="flex-1 p-4 overflow-auto min-h-[400px]">
              <div v-if="form.content" class="markdown-body" v-html="rendered"></div>
              <p v-else class="text-gray-300 text-center py-20">预览区 ~ 开始写点什么吧 🌸</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <NuxtLink to="/blog" class="btn-ghost">取消</NuxtLink>
          <button
            @click="submit"
            :disabled="!form.title.trim() || !form.content.trim() || submitting"
            class="btn-primary disabled:opacity-50"
          >
            {{ submitting ? '发布中...' : '🌸 发布文章' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const form = reactive({
  title: '',
  content: '',
  category: '',
  visibility: 'public',
})
const submitting = ref(false)
const rendered = computed(() => marked(form.content || ''))

const domains = ['安全', '开发', '设计', '理学', '工学', '医学', '交叉新兴', '外语', '经济学', '管理学', '职业技能', '通识']
const domainIconMap: Record<string, string> = {
  '安全': '🔒', '开发': '💻', '设计': '🎨', '理学': '🔬',
  '工学': '⚙️', '医学': '🏥', '交叉新兴': '🧬', '外语': '🌐',
  '经济学': '💰', '管理学': '📊', '职业技能': '💼', '通识': '📚'
}
function getDomainIcon(d: string) { return domainIconMap[d] || '📄' }

async function submit() {
  if (!form.title.trim() || !form.content.trim()) return
  submitting.value = true
  try {
    const res = await useApi<any>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.code === 200) {
      router.push(`/blog/${res.data.slug}`)
    } else {
      alert(res.message)
    }
  } catch (e: any) {
    alert('发布失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

// 简单的粘贴图片处理（转换为 data URL 插入 markdown）
async function handlePasteFromClipboard() {
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const file = await item.getType(type)
          const reader = new FileReader()
          reader.onload = (ev) => {
            form.content += `\n![image](${ev.target?.result})\n`
          }
          reader.readAsDataURL(file)
          return
        }
      }
    }
  } catch {
    alert('无法访问剪贴板，请直接 Ctrl+V 到编辑器中')
  }
}
</script>
