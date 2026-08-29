<template>
  <div class="card p-3">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-3 px-1">
      <span class="text-xs font-bold text-gray-600 flex items-center gap-1">
        <span>📁</span> {{ domain }}
        <span class="text-gray-400 font-normal">({{ categories.length }})</span>
      </span>
      <button
        v-if="userStore.isLoggedIn"
        @click="openCreate"
        class="text-xs text-[#dd3333] hover:text-red-700 flex items-center gap-0.5"
      >
        + 新建
      </button>
    </div>

    <!-- 文件夹列表 -->
    <div class="space-y-1">
      <!-- 全部 / 未分类 -->
      <button
        @click="$emit('select', '')"
        :class="folderBtnClass('')"
      >
        <span>📂 全部笔记</span>
        <span v-if="(countMap || {})['__all']" class="text-gray-400 text-xs ml-auto">{{ (countMap || {})['__all'] }}</span>
      </button>
      <button
        v-if="uncategorizedCount > 0"
        @click="$emit('select', '__uncategorized__')"
        :class="folderBtnClass('__uncategorized__')"
      >
        <span>📄 未分类</span>
        <span class="text-gray-400 text-xs ml-auto">{{ uncategorizedCount }}</span>
      </button>

      <!-- 动态文件夹 -->
      <div v-for="cat in categories" :key="cat.id" class="group/folder relative">
        <!-- 编辑态 -->
        <div v-if="editingId === cat.id" class="flex items-center gap-1 pl-2">
          <button @click="confirmRename(cat)" class="text-lg">{{ cat.icon || '📁' }}</button>
          <input
            v-model="editName"
            ref="editInput"
            class="flex-1 text-xs px-1.5 py-0.5 border border-[#dd3333] rounded outline-none"
            maxlength="20"
            @keyup.enter="confirmRename(cat)"
            @keyup.escape="editingId = null"
          />
          <button @click="confirmRename(cat)" class="text-[#dd3333] text-xs">✓</button>
          <button @click="editingId = null" class="text-gray-400 text-xs">✕</button>
        </div>

        <!-- 正常态 -->
        <button
          v-else
          @click="$emit('select', cat.name)"
          :class="folderBtnClass(cat.name)"
          @contextmenu.prevent="startEdit(cat)"
          @dblclick="startEdit(cat)"
        >
          <span>{{ cat.icon || '📁' }} {{ cat.name }}</span>
          <span class="flex items-center gap-1 ml-auto">
            <span class="text-gray-400 text-xs">{{ (cat as any).note_count || (countMap || {})[cat.name] || 0 }}</span>
            <span
              v-if="showActions && userStore.isLoggedIn"
              class="hidden group-hover/folder:flex items-center gap-1"
              @click.stop
            >
              <button
                title="重命名"
                class="w-5 h-5 rounded text-gray-400 hover:text-[#dd3333] hover:bg-red-50 text-xs leading-none flex items-center justify-center"
                @click="startEdit(cat)"
              >✎</button>
              <button
                v-if="userStore.isAdmin"
                title="删除"
                class="w-5 h-5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs leading-none flex items-center justify-center"
                @click="onDelete(cat)"
              >🗑</button>
            </span>
          </span>
        </button>
      </div>

      <!-- 新建输入框 -->
      <div v-if="creating" class="flex items-center gap-1 pl-2 mt-1">
        <span class="text-lg">📁</span>
        <input
          v-model="newName"
          ref="newInput"
          placeholder="新文件夹名"
          class="flex-1 text-xs px-1.5 py-0.5 border border-[#dd3333] rounded outline-none"
          maxlength="20"
          @keyup.enter="confirmCreate"
          @keyup.escape="creating = false"
        />
        <button @click="confirmCreate" class="text-[#dd3333] text-xs">✓</button>
        <button @click="creating = false" class="text-gray-400 text-xs">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CategoryRow {
  id: number
  name: string
  icon?: string
  note_count?: number
}

const props = defineProps<{
  domain: string
  selectedFolder?: string
  /** 外部传入的笔记计数（从 notes 列表计算出的每个文件夹数量） */
  countMap?: Record<string, number>
  /** 未分类笔记数 */
  uncategorizedCount?: number
  showActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', folder: string): void
  (e: 'change'): void
}>()

const userStore = useUserStore()
const toast = useToast()

const categories = ref<CategoryRow[]>([])
const creating = ref(false)
const newName = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')
const newInput = ref<HTMLInputElement>()
const editInput = ref<HTMLInputElement>()

// 加载
async function load() {
  try {
    const res = await useApi<any>(`/api/categories?domain=${encodeURIComponent(props.domain)}`)
    if (res.code === 200) categories.value = res.data || []
  } catch { /* ignore */ }
}

watch(() => props.domain, load, { immediate: true })

// ============ 新建 ============
function openCreate() {
  creating.value = true
  newName.value = ''
  nextTick(() => newInput.value?.focus())
}
async function confirmCreate() {
  if (!newName.value.trim()) { creating.value = false; return }
  try {
    const res = await useApi<any>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ domain: props.domain, name: newName.value.trim() }),
    })
    if (res.code === 200) {
      toast.success(`文件夹「${res.data.name}」已创建 ✨`)
      creating.value = false
      await load()
    } else {
      toast.error(res.message)
    }
  } catch { toast.error('网络错误') }
}

// ============ 重命名 ============
function startEdit(cat: CategoryRow) {
  editingId.value = cat.id
  editName.value = cat.name
  nextTick(() => editInput.value?.focus())
}
async function confirmRename(cat: CategoryRow) {
  if (!editName.value.trim() || editName.value === cat.name) {
    editingId.value = null
    return
  }
  try {
    const res = await useApi<any>(`/api/categories/${cat.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editName.value.trim() }),
    })
    if (res.code === 200) {
      toast.success('重命名成功')
      editingId.value = null
      await load()
      // 若当前选中的是这个旧文件夹，改成新名字
      if (props.selectedFolder === cat.name) {
        emit('select', editName.value.trim())
      }
    } else {
      toast.error(res.message)
    }
  } catch { toast.error('网络错误') }
}

// ============ 删除 ============
async function onDelete(cat: CategoryRow) {
  if (!confirm(`确定删除文件夹「${cat.name}」吗？里面的笔记需先转移。`)) return
  try {
    const res = await useApi<any>(`/api/categories/${cat.id}`, { method: 'DELETE' })
    if (res.code === 200) {
      toast.success('已删除')
      await load()
    } else {
      toast.error(res.message)
    }
  } catch { toast.error('网络错误') }
}

// ============ 样式 ============
function folderBtnClass(name: string) {
  const active = props.selectedFolder === name
  return `w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center transition ${
    active ? 'bg-red-50 text-[#dd3333] font-medium' : 'text-gray-600 hover:bg-gray-50'
  }`
}
</script>
