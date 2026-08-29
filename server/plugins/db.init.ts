// Nitro 启动时初始化数据库
import { getDb } from '../utils/db'

export default defineNitroPlugin(() => {
  try {
    getDb()
    console.log('🌸 [Nitro] 数据库初始化完成')
  } catch (e: any) {
    console.error('[Nitro] 数据库初始化失败:', e.message)
  }
})
