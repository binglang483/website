<template>
  <div>
    <!-- ========== 正文 + 右侧 TOC ========== -->
    <div class="flex gap-0 min-h-[calc(100vh-200px)]">
      <!-- 正文区 -->
      <div class="flex-1 min-w-0 max-w-4xl">
        <div v-if="loading" class="card p-8 text-center text-gray-400 text-sm">加载中...</div>

        <!-- ========== 无权限 ========== -->
        <div v-else-if="error === '这是私密文档，无权限访问'" class="card p-12 text-center">
          <p class="text-4xl mb-3">🔒</p>
          <p class="text-gray-500 text-sm mb-1">这是一篇私密文档</p>
          <p class="text-gray-400 text-xs mb-4">只有作者和管理员才能查看</p>
          <NuxtLink to="/docs" class="text-[#dd3333] text-sm hover:underline">← 返回公开文档</NuxtLink>
        </div>

        <!-- ========== 查看模式 ========== -->
        <template v-else-if="doc && !editMode">
          <article class="card p-6 md:p-8">
            <!-- 面包屑 -->
            <div class="flex items-center gap-1 text-xs text-gray-400 mb-4">
              <NuxtLink to="/docs" class="hover:text-[#dd3333]">📖 文档</NuxtLink>
              <template v-for="(seg, i) in pathSegments" :key="i">
                <span>/</span>
                <span class="text-gray-600">{{ seg }}</span>
              </template>
              <span v-if="doc.visibility === 'private'" class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600 border border-yellow-200">🔒 私密</span>
            </div>

            <!-- 作者信息头 -->
            <header class="mb-5 pb-5 border-b border-gray-100">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{{ doc.title }}</h1>
              <div class="flex items-center justify-between flex-wrap gap-2">
                <!-- 作者 -->
                <NuxtLink :to="`/user/${doc.author.id}`" class="flex items-center gap-2 group">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                    {{ (doc.author?.name || '?')[0] }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-700 group-hover:text-[#dd3333]">
                      {{ doc.author?.name || '未知作者' }}
                      <span v-if="doc.author?.role === 'admin'" class="text-[10px] px-1 py-0.5 ml-1 rounded text-white" style="background:#dd3333">管理员</span>
                    </div>
                    <div class="text-xs text-gray-400">
                      📅 {{ formatDate(doc.created_at) }}
                      <span class="mx-1">·</span>
                      👁️ {{ doc.view_count || 0 }} 阅读
                    </div>
                  </div>
                </NuxtLink>

                <!-- 操作按钮（作者本人或 admin）-->
                <div v-if="doc.canEdit" class="flex items-center gap-2">
                  <!-- 权限切换 -->
                  <div class="flex items-center gap-1 text-xs">
                    <button
                      @click="toggleVisibility"
                      class="flex items-center gap-1 px-2 py-1 rounded-md border transition"
                      :class="doc.visibility === 'public'
                        ? 'border-gray-200 text-gray-600 hover:border-[#dd3333] hover:text-[#dd3333]'
                        : 'border-yellow-300 bg-yellow-50 text-yellow-700'"
                      :title="doc.visibility === 'public' ? '点击设为私密' : '点击设为公开'"
                    >
                      {{ doc.visibility === 'public' ? '🌐 公开' : '🔒 私密' }}
                    </button>
                  </div>
                  <button @click="startEdit" class="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition">✏️ 编辑</button>
                  <button @click="confirmDelete" class="px-3 py-1 text-xs rounded-md bg-red-50 text-[#dd3333] hover:bg-red-100 transition">🗑️ 删除</button>
                </div>
              </div>
            </header>

            <!-- Markdown 渲染 -->
            <div class="markdown-body" v-html="rendered"></div>

            <!-- 页面底部 -->
            <div class="mt-10 pt-5 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
              <span v-if="doc.updated_at !== doc.created_at">最后更新：{{ formatDate(doc.updated_at) }}</span>
              <span class="ml-auto">{{ doc.content?.split('\n').length }} 行 · {{ doc.content?.length }} 字符</span>
            </div>
          </article>

          <!-- ========== 评论区 ========== -->
          <CommentSection v-if="doc?.id" type="document" :target-id="doc.id" />
        </template>

        <!-- ========== 编辑模式 ========== -->
        <template v-else>
          <article class="card p-6 md:p-8">
            <header class="mb-5 pb-5 border-b border-gray-100">
              <div class="flex items-center gap-2 mb-3">
                <span class="tag-sakura">{{ doc.domain }}</span>
                <span v-if="doc.subcategory" class="tag-anime">{{ doc.subcategory }}</span>
                <span class="text-xs text-[#dd3333] font-medium">📝 编辑中</span>
              </div>
              <input
                v-model="editForm.title"
                type="text"
                class="w-full text-2xl md:text-3xl font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#dd3333] focus:outline-none"
                placeholder="文档标题"
              />
            </header>

            <div class="mb-4">
              <textarea
                v-model="editForm.content"
                rows="20"
                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:border-[#dd3333] focus:outline-none resize-y"
                placeholder="支持 Markdown..."
              ></textarea>
              <p class="mt-1 text-xs text-gray-400">支持 Markdown · 字数 {{ editForm.content.length }}</p>
            </div>

            <details class="mb-5">
              <summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-700">👁️ 预览效果</summary>
              <div class="markdown-body mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100" v-html="previewRendered"></div>
            </details>

            <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button @click="saveEdit" :disabled="saving" class="px-4 py-2 rounded-md text-sm bg-[#dd3333] text-white hover:bg-red-600 disabled:opacity-50 transition">
                {{ saving ? '保存中...' : '💾 保存' }}
              </button>
              <button @click="cancelEdit" :disabled="saving" class="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition">取消</button>
              <span v-if="saveError" class="text-xs text-red-500 ml-2">{{ saveError }}</span>
            </div>
          </article>
        </template>

        <div v-if="!doc && !loading && error !== '这是私密文档，无权限访问'" class="card p-12 text-center">
          <p class="text-4xl mb-2">📭</p>
          <p class="text-gray-400 text-sm">{{ error || '文档不存在' }}</p>
          <NuxtLink to="/docs" class="mt-3 inline-block text-[#dd3333] text-sm hover:underline">← 返回文档首页</NuxtLink>
        </div>
      </div>

      <!-- ========== 右侧 TOC 目录 ========== -->
      <aside v-if="headings.length && !editMode" class="hidden md:block w-56 flex-shrink-0 ml-3">
        <div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">目录</h4>
          <ul class="space-y-0.5">
            <li v-for="h in headings" :key="h.id">
              <a
                :href="`#${h.id}`"
                class="block py-1 pr-2 text-xs text-gray-500 hover:text-[#dd3333] border-l-2 border-transparent hover:border-[#dd3333] transition truncate"
                :style="{ paddingLeft: (h.level - 1) * 12 + 'px' }"
                :class="{ 'border-[#dd3333] text-[#dd3333] font-medium': activeHeading === h.id }"
                @click.prevent="scrollToHeading(h.id)"
              >{{ h.text }}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMarkdown } from '~/composables/useMarkdown'
const { render } = useMarkdown()

const route = useRoute()
const userStore = useUserStore()

// ============ 状态 ============
const doc = ref<any>(null)
const content = ref('')
const loading = ref(true)
const error = ref('')
const headings = ref<{ id: string; text: string; level: number }[]>([])
const activeHeading = ref('')
const editMode = ref(false)
const saving = ref(false)
const saveError = ref('')

const editForm = reactive({ title: '', content: '' })

// ============ slugify ============
const slugify = (text: string) => {
  let t = text.replace(/[`*_#]/g, '')
  t = t.replace(/[，。！？、「」『』（）【】《》〈〉""''：；—\u200B-\u200D\uFEFF]/g, '')
  return t.trim().replace(/\s+/g, '-').toLowerCase() || 'section'
}

// ============ 路径处理 ============
const pathSegments = computed(() => {
  const raw = (route.params.path as string[]) || []
  const arr = Array.isArray(raw) ? raw : raw.split('/').filter(Boolean)
  return arr.map(s => decodeURIComponent(s))
})

const currentPath = computed(() => pathSegments.value.join('/') || '')

// ============ 加载 ============
async function loadContent() {
  userStore.init()
  loading.value = true
  error.value = ''
  headings.value = []
  activeHeading.value = ''

  try {
    const path = currentPath.value
    const res = await useApi<any>(`/api/docs/${encodeURI(path)}`)
    if (res.code === 200) {
      doc.value = res.data
      content.value = res.data.content
      extractHeadings(res.data.content)
    } else if (res.code === 302 && res.redirect) {
      navigateTo(res.redirect)
      return
    } else {
      error.value = res.message
      doc.value = null
      content.value = ''
    }
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    doc.value = null
    content.value = ''
  } finally {
    loading.value = false
  }
}

function extractHeadings(md: string) {
  const list: { id: string; text: string; level: number }[] = []
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{1,4})\s+(.+)/)
    if (m) list.push({ level: m[1].length, text: m[2].replace(/[`*_]/g, ''), id: slugify(m[2]) })
  }
  headings.value = list
}

const rendered = computed(() => render(content.value || ''))
const previewRendered = computed(() => render(editForm.content || ''))

// ============ 编辑 ============
function startEdit() {
  editForm.title = doc.value.title
  editForm.content = doc.value.content
  editMode.value = true
  saveError.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() { editMode.value = false; saveError.value = '' }

async function saveEdit() {
  if (!editForm.title.trim() || !editForm.content.trim()) {
    saveError.value = '标题和内容不能为空'; return
  }
  saving.value = true; saveError.value = ''
  try {
    const res = await useApi<any>(`/api/docs/${doc.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editForm.title.trim(), content: editForm.content })
    })
    if (res.code === 200) {
      doc.value.title = editForm.title.trim()
      doc.value.content = editForm.content
      doc.value.updated_at = new Date().toISOString()
      content.value = editForm.content
      extractHeadings(editForm.content)
      editMode.value = false
    } else {
      saveError.value = res.message || '保存失败'
    }
  } catch (e: any) { saveError.value = '网络错误' }
  finally { saving.value = false }
}

async function toggleVisibility() {
  const newVis = doc.value.visibility === 'public' ? 'private' : 'public'
  try {
    const res = await useApi<any>(`/api/docs/${doc.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ visibility: newVis })
    })
    if (res.code === 200) {
      doc.value.visibility = newVis
    } else {
      alert(res.message)
    }
  } catch { alert('操作失败') }
}

async function confirmDelete() {
  if (!confirm('确定要删除这篇文档吗？此操作不可撤销。')) return
  try {
    const res = await useApi<any>(`/api/docs/${doc.value.id}`, { method: 'DELETE' })
    if (res.code === 200) navigateTo('/docs')
    else alert(res.message)
  } catch { alert('网络错误') }
}

function scrollToHeading(id: string) {
  activeHeading.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let scrollTimer: any
function onScroll() {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const scrollTop = window.scrollY + 120
    let current = headings.value[0]?.id || ''
    for (const h of headings.value) {
      const el = document.getElementById(h.id)
      if (el && el.offsetTop <= scrollTop) current = h.id
      else break
    }
    activeHeading.value = current
  }, 100)
}

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }

// ============ 生命周期 ============
onMounted(() => {
  loadContent()
  window.addEventListener('scroll', onScroll)
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
watch(currentPath, () => { if (currentPath.value) { loadContent(); window.scrollTo({ top: 0 }) } })
</script>

<style>
.scroll-mt-20 { scroll-margin-top: 80px; }
</style>
