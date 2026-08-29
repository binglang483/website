<template>
  <div>
    <NuxtLink to="/blog" class="text-sm text-gray-500 hover:text-[#dd3333] mb-4 inline-block">← 返回博客列表</NuxtLink>

    <div v-if="loading" class="card p-12 text-center text-gray-400 text-sm">加载中...</div>

    <article v-else-if="article" class="card p-6 md:p-8">
      <!-- ========== 查看模式 ========== -->
      <template v-if="!editMode">
        <!-- 标题区 -->
        <header class="mb-6 pb-5 border-b border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs px-1.5 py-0.5 rounded" style="background:#fff1f1;color:#dd3333">{{ article.category || '随笔' }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{{ article.title }}</h1>
          <div class="flex items-center justify-between flex-wrap gap-3 text-sm text-gray-500">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {{ (article.author_nick || article.author_name)?.[0] }}
                </div>
                <span>{{ article.author_nick || article.author_name }}</span>
              </div>
              <span class="hidden sm:inline">📅 {{ formatDate(article.created_at) }}</span>
              <span>👁️ {{ article.view_count }} 阅读</span>
              <span>💬 {{ comments.length }} 评论</span>
            </div>
            <!-- 权限按钮 -->
            <div v-if="canEdit" class="flex items-center gap-2">
              <button @click="startEdit" class="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition">✏️ 编辑</button>
              <button @click="confirmDelete" class="px-3 py-1 text-xs rounded-md bg-red-50 text-[#dd3333] hover:bg-red-100 transition">🗑️ 删除</button>
            </div>
          </div>
        </header>

        <!-- 正文 -->
        <div class="markdown-body" v-html="rendered"></div>

        <!-- 操作栏 -->
        <div class="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div class="text-xs text-gray-400">
            最后更新：{{ formatDate(article.updated_at) }}
          </div>
        </div>
      </template>

      <!-- ========== 编辑模式 ========== -->
      <template v-else>
        <header class="mb-5 pb-5 border-b border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs px-1.5 py-0.5 rounded" style="background:#fff1f1;color:#dd3333">{{ article.category || '随笔' }}</span>
            <span class="text-xs text-[#dd3333] font-medium">📝 编辑中</span>
          </div>
          <input
            v-model="editForm.title"
            type="text"
            class="w-full text-2xl md:text-3xl font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#dd3333] focus:outline-none"
            placeholder="文章标题"
          />
        </header>

        <div class="mb-4">
          <textarea
            v-model="editForm.content"
            rows="20"
            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:border-[#dd3333] focus:outline-none resize-y"
            placeholder="支持 Markdown..."
          ></textarea>
          <p class="mt-1 text-xs text-gray-400">支持 Markdown 格式 · 字数 {{ editForm.content.length }}</p>
        </div>

        <details class="mb-5">
          <summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-700">👁️ 预览效果</summary>
          <div class="markdown-body mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100" v-html="previewRendered"></div>
        </details>

        <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
          <button
            @click="saveEdit"
            :disabled="saving"
            class="px-4 py-2 rounded-md text-sm bg-[#dd3333] text-white hover:bg-red-600 disabled:opacity-50 transition"
          >{{ saving ? '保存中...' : '💾 保存' }}</button>
          <button
            @click="cancelEdit"
            :disabled="saving"
            class="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition"
          >取消</button>
          <span v-if="saveError" class="text-xs text-red-500 ml-2">{{ saveError }}</span>
        </div>
      </template>
    </article>

    <div v-else class="card p-12 text-center">
      <p class="text-5xl mb-3">😢</p>
      <p class="text-gray-400">文章不存在或已删除</p>
    </div>

    <!-- ========== 评论区 ========== -->
    <section v-if="article && !editMode" class="mt-6 card p-5">
      <h3 class="font-bold text-base mb-4 flex items-center gap-2 text-gray-800">
        <span>💬</span> 评论 <span class="text-xs text-gray-400">({{ comments.length }})</span>
      </h3>

      <!-- 发表评论 -->
      <div v-if="userStore.isLoggedIn" class="mb-5">
        <textarea
          v-model="commentText"
          placeholder="说点什么吧~"
          class="input min-h-[72px] resize-y"
          rows="3"
        ></textarea>
        <div class="flex justify-end mt-2">
          <button
            @click="submitComment"
            :disabled="!commentText.trim() || submitting"
            class="btn-primary text-xs disabled:opacity-50"
          >{{ submitting ? '发送中...' : '✨ 发表评论' }}</button>
        </div>
      </div>
      <div v-else class="mb-5 p-4 rounded-lg bg-gray-50 border border-gray-100 text-center text-sm text-gray-500">
        <NuxtLink to="/login" class="text-[#dd3333] font-medium">登录</NuxtLink> 后才能发表评论哦~
      </div>

      <!-- 评论列表 -->
      <div v-if="comments.length" class="space-y-2">
        <div v-for="c in comments" :key="c.id" class="p-3 rounded-lg bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {{ (c.nickname || c.username)?.[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-sm text-gray-700">{{ c.nickname || c.username }}</span>
                <span class="text-xs text-gray-400">{{ formatDate(c.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ c.content }}</p>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-center text-gray-400 text-sm py-4">还没有评论，抢沙发！🪑</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const route = useRoute()
const userStore = useUserStore()
const article = ref<any>(null)
const comments = ref<any[]>([])
const loading = ref(true)
const commentText = ref('')
const submitting = ref(false)
const editMode = ref(false)
const saving = ref(false)
const saveError = ref('')

const editForm = reactive({
  title: '',
  content: ''
})

const canEdit = computed(() => userStore.isLoggedIn && (userStore.user?.id === article.value?.author_id || userStore.isAdmin))

const rendered = computed(() => marked(article.value?.content || ''))
const previewRendered = computed(() => marked(editForm.content || ''))

onMounted(async () => {
  userStore.init()
  const slug = route.params.slug as string
  try {
    const res = await useApi<any>(`/api/articles/${slug}`)
    if (res.code === 200) {
      article.value = res.data
      const cr = await useApi<any>(`/api/comments/list/${res.data.id}`)
      if (cr.code === 200) comments.value = cr.data
    }
  } finally {
    loading.value = false
  }
})

function startEdit() {
  editForm.title = article.value.title
  editForm.content = article.value.content
  editMode.value = true
  saveError.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editMode.value = false
  saveError.value = ''
}

async function saveEdit() {
  if (!editForm.title.trim() || !editForm.content.trim()) {
    saveError.value = '标题和内容不能为空'
    return
  }
  saving.value = true
  saveError.value = ''
  try {
    const res = await useApi<any>(`/api/articles/${article.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editForm.title.trim(), content: editForm.content })
    })
    if (res.code === 200) {
      article.value.title = editForm.title.trim()
      article.value.content = editForm.content
      article.value.updated_at = new Date().toISOString()
      editMode.value = false
    } else {
      saveError.value = res.message || '保存失败'
    }
  } catch (e: any) {
    saveError.value = '网络错误，请重试'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return
  try {
    const res = await useApi<any>(`/api/articles/${article.value.id}`, {
      method: 'DELETE'
    })
    if (res.code === 200) {
      alert('已删除')
      navigateTo('/blog')
    } else {
      alert(res.message || '删除失败')
    }
  } catch (e) {
    alert('网络错误')
  }
}

async function submitComment() {
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    const res = await useApi<any>('/api/comments/create', {
      method: 'POST',
      body: JSON.stringify({ articleId: article.value.id, content: commentText.value })
    })
    if (res.code === 200) {
      comments.value.push(res.data)
      commentText.value = ''
      article.value.comment_count++
    }
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
