import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'washi' // 和式主题（默认）
export type Lang = 'zh' | 'en' | 'ja'

interface WallSettings {
  autoPlay: boolean
  interval: number // ms
  selected: string | null // 手动选的壁纸
}

interface State {
  theme: Theme
  lang: Lang
  wallpapers: WallSettings
  fontSize: 'sm' | 'md' | 'lg'
  animations: boolean
}

const STORAGE_KEY = 'gaku-no-niwa-settings'

function loadFromStorage(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    theme: 'washi',
    lang: 'zh',
    wallpapers: { autoPlay: true, interval: 6000, selected: null, opacity: 0.45 },
    fontSize: 'md',
    animations: true,
    ...loadFromStorage()
  }),
  getters: {
    isDark: (s) => s.theme === 'dark',
    isWashi: (s) => s.theme === 'washi',
  },
  actions: {
    setTheme(t: Theme) { this.theme = t; this.applyTheme(); this.persist() },
    setLang(l: Lang) { this.lang = l; this.persist() },
    setWallSettings(patch: Partial<WallSettings>) { Object.assign(this.wallpapers, patch); this.persist() },
    setFontSize(s: 'sm'|'md'|'lg') { this.fontSize = s; this.applyTheme(); this.persist() },
    setAnimations(b: boolean) { this.animations = b; this.persist() },
    persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state)) } catch {}
    },
    applyTheme() {
      const root = document.documentElement
      root.setAttribute('data-theme', this.theme)
      if (this.theme === 'dark') {
        root.style.setProperty('--body-bg', '#1a1a2e')
        root.style.setProperty('--body-fg', '#e0e0e0')
        root.style.setProperty('--card-bg', '#252540')
        root.style.setProperty('--border', '#3a3a5c')
        root.style.setProperty('--ink', '#f0f0f0')
        root.style.setProperty('--hero-bg', 'linear-gradient(135deg,#2d2a4a 0%,#1a1a2e 50%,#16213e 100%)')
      } else if (this.theme === 'washi') {
        root.style.setProperty('--body-bg', '#faf8f5')
        root.style.setProperty('--body-fg', '#3a3a3a')
        root.style.setProperty('--card-bg', '#ffffff')
        root.style.setProperty('--border', '#eceae4')
        root.style.setProperty('--ink', '#3a3a3a')
        root.style.setProperty('--hero-bg', 'linear-gradient(135deg,#fce4ec 0%,#e8eaf6 50%,#e8f5e9 100%)')
      } else { // light
        root.style.setProperty('--body-bg', '#ffffff')
        root.style.setProperty('--body-fg', '#1f2937')
        root.style.setProperty('--card-bg', '#ffffff')
        root.style.setProperty('--border', '#e5e7eb')
        root.style.setProperty('--ink', '#111827')
        root.style.setProperty('--hero-bg', 'linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%)')
      }
      root.style.fontSize = this.fontSize === 'sm' ? '14px' : this.fontSize === 'lg' ? '17px' : '16px'
    }
  }
})