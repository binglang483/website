<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium backdrop-blur"
          :class="toastClass(t.type)"
          @click="dismiss(t.id)"
        >
          <span class="text-base">{{ toastIcon(t.type) }}</span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()

function toastClass(type: string) {
  switch (type) {
    case 'success': return 'bg-green-500/95 text-white'
    case 'error':   return 'bg-red-500/95 text-white'
    case 'warning': return 'bg-yellow-500/95 text-white'
    default:        return 'bg-gray-800/95 text-white'
  }
}

function toastIcon(type: string) {
  switch (type) {
    case 'success': return '✅'
    case 'error':   return '❌'
    case 'warning': return '⚠️'
    default:        return '💡'
  }
}
</script>

<style>
/* Toast 动画 */
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-move {
  transition: transform 0.2s;
}
</style>
