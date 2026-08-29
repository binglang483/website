<template>
  <div>
    <NuxtLink to="/notes" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回笔记</NuxtLink>

    <div class="card p-6">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">📝 新建笔记</h1>

      <div class="space-y-4">
        <input v-model="form.title" type="text" placeholder="笔记标题..." class="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-sakura-400 outline-none py-2 bg-transparent" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select v-model="form.domain" @change="form.subcategory = ''" class="input">
            <option value="">选择领域</option>
            <option v-for="d in domains" :key="d" :value="d">{{ iconMap[d] }} {{ d }}</option>
          </select>
          <select v-model="form.subcategory" class="input" :disabled="!form.domain">
            <option value="">选择子分类</option>
            <option v-for="s in availableSubs" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="border-2 border-sakura-100 rounded-2xl overflow-hidden">
          <textarea
            v-model="form.content"
            placeholder="# 笔记标题&#10;&#10;在这里记录你的想法..."
            class="w-full p-4 outline-none font-mono text-sm leading-relaxed min-h-[400px] resize-y"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="preview = !preview" class="btn-ghost">{{ preview ? '编辑' : '👁️ 预览' }}</button>
          <button
            @click="submit"
            :disabled="!canSubmit || submitting"
            class="btn-primary disabled:opacity-50"
          >{{ submitting ? '保存中...' : '🌸 保存笔记' }}</button>
        </div>

        <div v-if="preview && form.content" class="card p-4">
          <div class="markdown-body" v-html="rendered"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const { domainNames, getSubcategories, iconMap } = useDomains()
const form = reactive({ title: '', content: '', domain: '', subcategory: '' })
const submitting = ref(false)
const preview = ref(false)
const rendered = computed(() => marked(form.content || ''))

const domains = domainNames
const availableSubs = computed(() => getSubcategories(form.domain))

const canSubmit = computed(() => form.title.trim() && form.content.trim() && form.domain && form.subcategory)

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const res = await useApi<any>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.code === 200) {
      router.push(`/notes/${res.data.slug}`)
    } else {
      alert(res.message)
    }
  } catch (e: any) {
    alert('保存失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>
