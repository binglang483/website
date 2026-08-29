/**
 * 全局 Toast 提示 composable
 * 使用方式:
 *   const toast = useToast()
 *   toast.success('保存成功')
 *   toast.error('保存失败')
 *   toast.info('提示')
 *   toast.show({ message: '...', type: 'success', duration: 3000 })
 */

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

// 全局单例状态（跨组件共享）
const toasts = ref<ToastItem[]>([])
let nextId = 1

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'info', duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function dismiss(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx >= 0) toasts.value.splice(idx, 1)
  }

  function success(msg: string, duration = 3000) { return show(msg, 'success', duration) }
  function error(msg: string, duration = 4000) { return show(msg, 'error', duration) }
  function info(msg: string, duration = 3000) { return show(msg, 'info', duration) }
  function warning(msg: string, duration = 3500) { return show(msg, 'warning', duration) }

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    info,
    warning,
  }
}
