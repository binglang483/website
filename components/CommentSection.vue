<template>
  <section class="card p-5 mt-6">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
        <span class="w-1 h-4 rounded-full" style="background:#dd3333"></span>
        💬 评论 <span class="text-xs text-gray-400 font-normal">({{ flatList.length }})</span>
      </h3>
    </div>

    <!-- ========== 发表评论 ========== -->
    <div class="mb-6">
      <!-- 未登录引导 -->
      <template v-if="!userStore.isLoggedIn">
        <div class="p-4 rounded-lg bg-gray-50 text-center text-sm text-gray-500 border border-gray-100">
          <p class="mb-2">🔒 登录后才能发表评论哦~</p>
          <NuxtLink :to="`/login?redirect=${encodeURIComponent(currentFullPath)}`" class="btn-primary text-xs py-1.5">
            去登录
          </NuxtLink>
        </div>
      </template>

      <!-- 登录后评论框 -->
      <template v-else>
        <!-- 回复提示条 -->
        <div v-if="replyingTo" class="mb-2 flex items-center gap-2 text-xs px-3 py-1.5 bg-sakura-50 rounded text-[#dd3333]">
          <span>↩️ 正在回复 @{{ replyingTo.nickname || replyingTo.username }}</span>
          <button @click="cancelReply" class="ml-auto hover:text-red-700">✕</button>
        </div>

        <div class="flex gap-3">
          <!-- 头像 -->
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {{ (userStore.user?.nickname || userStore.user?.username || 'U')?.[0] }}
          </div>

          <!-- 输入区 -->
          <div class="flex-1">
            <textarea
              v-model="newContent"
              rows="3"
              :placeholder="replyingTo ? `回复 @${replyingTo.nickname || replyingTo.username}...` : '写下你的想法...'"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#dd3333] focus:ring-2 focus:ring-red-100 transition resize-none"
              maxlength="1000"
            ></textarea>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-400">{{ newContent.length }}/1000</span>
              <button
                @click="submitComment"
                :disabled="!newContent.trim() || submitting"
                class="px-4 py-1.5 rounded-md text-sm text-white disabled:opacity-50 transition"
                style="background:linear-gradient(135deg,#f472b6,#a855f7)"
              >{{ submitting ? '发送中...' : '✨ 发表评论' }}</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ========== 评论列表 ========== -->
    <div v-if="loading" class="text-center text-gray-400 text-sm py-8">加载评论中... 🌸</div>

    <div v-else-if="rootComments.length === 0" class="text-center text-gray-400 text-sm py-8">
      <p class="text-3xl mb-2">💭</p>
      <p>还没有评论，抢个沙发吧~</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="c in rootComments"
        :key="c.id"
        :comment="c"
        :depth="0"
        :current-user-id="userStore.user?.id"
        :is-admin="userStore.isAdmin"
        :replying-id="replyingTo?.id"
        @reply="startReply"
        @delete="onDelete"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 评论区域组件
 * Props:
 *   type: 'document' | 'note' | 'article' — 内容类型
 *   targetId: number — 内容 ID
 */
import CommentItem from './CommentItem.vue'

interface CommentUser {
  username: string
  nickname?: string
  avatar?: string | null
  role?: string
}

interface CommentNode {
  id: number
  commentable_type: string
  commentable_id: number
  user_id: number
  parent_id: number | null
  content: string
  created_at: string
  username: string
  nickname: string
  avatar: string | null
  role: string
  replies?: CommentNode[]
}

const props = defineProps<{
  type: 'document' | 'note' | 'article'
  targetId: number
}>()

const userStore = useUserStore()
const route = useRoute()
const toast = useToast()

// ========== 状态 ==========
const flatList = ref<CommentNode[]>([])
const loading = ref(true)
const newContent = ref('')
const submitting = ref(false)
const replyingTo = ref<CommentNode | null>(null)

// ========== 计算：组装嵌套结构 ==========
const rootComments = computed<CommentNode[]>(() => {
  const map = new Map<number, CommentNode>()
  const roots: CommentNode[] = []

  for (const c of flatList.value) {
    map.set(c.id, { ...c, replies: [] })
  }
  for (const c of flatList.value) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(node)
    } else {
      roots.push(node)
    }
  }
  // 按 created_at 排序
  const sortFn = (a: CommentNode, b: CommentNode) => a.created_at.localeCompare(b.created_at)
  roots.sort(sortFn)
  for (const n of map.values()) n.replies?.sort(sortFn)

  return roots
})

// ========== 当前完整路径（用于登录跳转回原页面） ==========
const currentFullPath = computed(() => route.fullPath)

// ========== 加载评论 ==========
async function loadComments() {
  loading.value = true
  try {
    const res = await useApi<any>(
      `/api/comments?type=${props.type}&id=${props.targetId}`
    )
    if (res.code === 200) {
      flatList.value = res.data || []
    }
  } catch {
    toast.error('评论加载失败')
  } finally {
    loading.value = false
  }
}

// ========== 发表评论 ==========
async function submitComment() {
  if (!newContent.value.trim()) return
  submitting.value = true
  try {
    const res = await useApi<any>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        type: props.type,
        targetId: props.targetId,
        content: newContent.value.trim(),
        parentId: replyingTo.value?.id || undefined,
      }),
    })
    if (res.code === 200) {
      toast.success(replyingTo.value ? '回复成功 🌸' : '评论成功 🌸')
      newContent.value = ''
      cancelReply()
      // 前端直接追加，不重新请求
      flatList.value.push(res.data as CommentNode)
    } else if (res.code === 401) {
      toast.error('请先登录')
      navigateTo(`/login?redirect=${encodeURIComponent(currentFullPath.value)}`)
    } else {
      toast.error(res.message || '发表失败')
    }
  } catch {
    toast.error('网络错误，请重试')
  } finally {
    submitting.value = false
  }
}

// ========== 回复 ==========
function startReply(c: CommentNode) {
  // 如果嵌套已经很深，提升为根评论回复（简化层级）
  replyingTo.value = c
  // 滚动到评论框
  setTimeout(() => {
    const ta = document.querySelector('.comment-area textarea') as HTMLElement
    ta?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ta?.focus()
  }, 50)
}

function cancelReply() {
  replyingTo.value = null
}

// ========== 删除评论 ==========
async function onDelete(id: number) {
  if (!confirm('确定要删除这条评论吗？')) return
  try {
    const res = await useApi<any>(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.code === 200) {
      toast.success('评论已删除')
      // 前端移除
      flatList.value = flatList.value.filter(c => c.id !== id)
    } else {
      toast.error(res.message || '删除失败')
    }
  } catch {
    toast.error('网络错误')
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  userStore.init()
  loadComments()
})
</script>

<style>
/* 滚动定位用 */
.comment-area { scroll-margin-top: 80px; }
</style>
