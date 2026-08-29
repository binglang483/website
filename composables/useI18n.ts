import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { t, dict, LANGS } from './i18n'

export function useI18n() {
  const settings = useSettingsStore()
  const lang = computed(() => settings.lang)
  function translate(key: string) { return t(key, settings.lang) }
  function setLang(l: typeof LANGS[number]) { settings.setLang(l) }
  return { t: translate, lang, setLang, LANGS, dict }
}