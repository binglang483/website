<template>
  <div class="comment-area">
    <div class="flex gap-3">
      <!-- 头像 -->
      <div
        class="w-9 h-9 rounded-lg bg-gradient-to-br from-sakura-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
        :class="{ 'w-8 h-8 text-xs': depth > 0 }"
      >
        {{ avatarText }}
      </div>

      <!-- 评论内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <span class="text-sm font-medium text-gray-800 hover:text-[#dd3333] cursor-default">
            {{ comment.nickname || comment.username }}
          </span>
          <span v-if="comment.role === 'admin'" class="text-[10px] px-1.5 py-0.5 rounded text-white" style="background:#dd3333">管理员</span>
          <span class="text-xs text-gray-400">{{ timeAgo }}</span>
        </div>

        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mb-2">
          {{ comment.content }}
        </div>

        <!-- 操作条 -->
        <div class="flex items-center gap-3 text-xs">
          <button
            class="text-gray-400 hover:text-[#dd3333] transition"
            :class="{ 'text-[#dd3333]': replyingId === comment.id }"
            @click="$emit('reply', comment)"
          >↩️ 回复</button>

          <button
            v-if="canDelete"
            class="text-gray-400 hover:text-red-500 transition"
            @click="$emit('delete', comment.id)"
          >🗑️ 删除</button>
        </div>

        <!-- 回复列表（最多嵌套 3 层） -->
        <div
          v-if="comment.replies && comment.replies.length"
          class="mt-3 pl-3 border-l-2 border-gray-100 space-y-3"
        >
          <CommentItem
            v-for="r in comment.replies"
            :key="r.id"
            :comment="r"
            :depth="depth + 1"
            :current-user-id="currentUserId"
            :is-admin="isAdmin"
            :replying-id="replyingId"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommentNode {
  id: number
  user_id: number
  parent_id: number | null
  content: string
  created_at: string
  username: string
  nickname?: string
  avatar?: string | null
  role?: string
  replies?: CommentNode[]
}

const props = defineProps<{
  comment: CommentNode
  depth: number
  currentUserId?: number | null
  isAdmin?: boolean
  replyingId?: number | null
}>()

defineEmits<{
  (e: 'reply', comment: CommentNode): void
  (e: 'delete', id: number): void
}>()

// 头像文字（取第一个字符）
const avatarText = computed(() => {
  const name = props.comment.nickname || props.comment.username || '?'
  return name[0]?.toUpperCase() || '?'
})

// 权限判断：是否可删除
const canDelete = computed(() => {
  if (!props.currentUserId) return false
  return props.comment.user_id === props.currentUserId || props.isAdmin
})

// 相对时间显示
const timeAgo = computed(() => formatTimeAgo(props.comment.created_at))

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr.replace(' ', 'T'))
  if (isNaN(date.getTime())) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay < 7) return `${diffDay} 天前`
  // 超过 7 天显示具体日期
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d} ${hh}:${mm}`
}
</script>
