<template>
  <div>
    <NuxtLink to="/knowledge" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回知识库</NuxtLink>

    <div v-if="loading" class="card p-12 text-center text-gray-400">加载中... 🌸</div>

    <article v-else-if="note" class="card p-6 md:p-8">
      <!-- ========== 查看模式 ========== -->
      <template v-if="!editMode">
        <header class="mb-6 pb-6 border-b border-sakura-100">
          <div class="flex items-center gap-2 mb-2">
            <NuxtLink :to="`/knowledge/${encodeURIComponent(note.domain)}`" class="tag-sakura">{{ note.domain }}</NuxtLink>
            <NuxtLink :to="`/knowledge/${encodeURIComponent(note.domain)}/${encodeURIComponent(note.subcategory)}`" class="tag-anime">{{ note.subcategory }}</NuxtLink>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ note.title }}</h1>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>👤 {{ note.author_nick || note.author_name }}</span>
              <span>📅 {{ formatDate(note.created_at) }}</span>
              <span v-if="note.updated_at !== note.created_at" class="text-xs text-gray-400">更新于 {{ formatDate(note.updated_at) }}</span>
            </div>
            <!-- 权限按钮：创建者或管理员可见 -->
            <div v-if="canEdit" class="flex items-center gap-2">
              <button @click="startEdit" class="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition">✏️ 编辑</button>
              <button @click="confirmDelete" class="px-3 py-1 text-xs rounded-md bg-red-50 text-[#dd3333] hover:bg-red-100 transition">🗑️ 删除</button>
            </div>
          </div>
        </header>

        <div class="markdown-body" v-html="rendered"></div>
      </template>

      <!-- ========== 编辑模式 ========== -->
      <template v-else>
        <header class="mb-5 pb-5 border-b border-sakura-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="tag-sakura">{{ note.domain }}</span>
            <span class="tag-anime">{{ note.subcategory }}</span>
            <span class="text-xs text-[#dd3333] font-medium">📝 编辑中</span>
          </div>
          <input
            v-model="editForm.title"
            type="text"
            class="w-full text-2xl font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:border-[#dd3333] focus:outline-none"
            placeholder="笔记标题"
          />
        </header>

        <div class="mb-4">
          <textarea
            v-model="editForm.content"
            rows="18"
            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:border-[#dd3333] focus:outline-none resize-y"
            placeholder="支持 Markdown..."
          ></textarea>
          <p class="mt-1 text-xs text-gray-400">支持 Markdown 格式 · 字数 {{ editForm.content.length }}</p>
        </div>

        <!-- 预览 -->
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
      <p class="text-gray-400">笔记不存在或已删除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
const route = useRoute()
const userStore = useUserStore()
const note = ref<any>(null)
const loading = ref(true)
const editMode = ref(false)
const saving = ref(false)
const saveError = ref('')

const editForm = reactive({
  title: '',
  content: ''
})

const canEdit = computed(() => userStore.isLoggedIn && (userStore.user?.id === note.value?.author_id || userStore.isAdmin))

const rendered = computed(() => marked(note.value?.content || ''))
const previewRendered = computed(() => marked(editForm.content || ''))

onMounted(async () => {
  userStore.init()
  const slug = route.params.slug as string
  try {
    const res = await useApi<any>(`/api/notes/${slug}`)
    if (res.code === 200) note.value = res.data
  } finally {
    loading.value = false
  }
})

function startEdit() {
  editForm.title = note.value.title
  editForm.content = note.value.content
  editMode.value = true
  saveError.value = ''
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
    const res = await useApi<any>(`/api/notes/${note.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editForm.title.trim(), content: editForm.content })
    })
    if (res.code === 200) {
      note.value.title = editForm.title.trim()
      note.value.content = editForm.content
      note.value.updated_at = new Date().toISOString()
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
  if (!confirm('确定要删除这条笔记吗？此操作不可撤销。')) return
  try {
    const res = await useApi<any>(`/api/notes/${note.value.id}`, {
      method: 'DELETE'
    })
    if (res.code === 200) {
      alert('已删除')
      navigateTo('/knowledge')
    } else {
      alert(res.message || '删除失败')
    }
  } catch (e) {
    alert('网络错误')
  }
}

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
</script>
