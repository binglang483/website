<template>
  <div>
    <NuxtLink to="/knowledge" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回知识库</NuxtLink>

    <div class="card p-6">
      <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">📝 新建笔记</h1>

      <div class="space-y-4">
        <input v-model="form.title" type="text" placeholder="笔记标题..." class="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-sakura-400 outline-none py-2 bg-transparent" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select v-model="form.domain" @change="form.subcategory = ''" class="input">
            <option value="">选择领域</option>
            <option v-for="d in domains" :key="d" :value="d">{{ domainIcons[d] }} {{ d }}</option>
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
const form = reactive({ title: '', content: '', domain: '', subcategory: '' })
const submitting = ref(false)
const preview = ref(false)
const rendered = computed(() => marked(form.content || ''))

const allDomains: Record<string, string[]> = {
  '安全': ['逆向工程', '漏洞分析', '漏洞利用', '病毒分析', '加壳脱壳', 'CTF竞赛', '渗透测试', '安全工具开发'],
  '开发': ['前端开发', '后端开发', '移动端开发', '游戏开发', '嵌入式/物联网', '桌面应用', '数据库管理', '云原生与DevOps'],
  '设计': ['平面设计', 'UI/UX设计', '3D设计与建模', '视频与动效', '游戏美术', '工业设计'],
  '理学': ['数学', '物理学', '化学', '天文学', '地理科学', '大气/海洋科学', '地球地质学', '生物科学', '统计学', '心理学'],
  '工学': ['计算机与电子信息', '机械与能源动力', '土木建筑水利', '材料化工', '航空航天兵器', '地质矿业安全', '交通运输', '轻工纺织食品', '环境与生物工程', '核工程'],
  '医学': ['基础医学', '临床医学', '口腔医学', '预防医学', '药学', '生物医学工程', '医学检验', '医学影像', '公共卫生'],
  '交叉新兴': ['大数据/AI/区块链', '新能源/储能', '半导体/芯片', '生物医学/合成生物', '遥感/空间信息', '智能制造/机器人', '量子信息/计算'],
  '外语': ['英语', '日语', '韩语', '俄语', '翻译学', '小语种'],
  '经济学': ['理论经济', '金融学', '国际贸易', '财政学', '税收', '保险', '数字经济'],
  '管理学': ['工商管理', '公共管理', '管理科学与工程'],
  '职业技能': ['产品/策划', '运营/市场', '工业制造', '研发管理', '人力资源', '财务/会计', '采购/供应链', '销售'],
  '通识': ['学习方法', '工具效率', '资源分享']
}
const domains = Object.keys(allDomains)
const availableSubs = computed(() => allDomains[form.domain] || [])
const domainIcons: Record<string, string> = {
  '安全': '🔒', '开发': '💻', '设计': '🎨', '理学': '🔬',
  '工学': '⚙️', '医学': '🏥', '交叉新兴': '🧬', '外语': '🌐',
  '经济学': '💰', '管理学': '📊', '职业技能': '💼', '通识': '📚'
}

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
