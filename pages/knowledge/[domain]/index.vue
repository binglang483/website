<template>
  <div>
    <NuxtLink to="/knowledge" class="text-sm text-sakura-600 hover:underline mb-4 inline-block">← 返回知识库</NuxtLink>

    <div class="card p-6 mb-6" :class="getHeaderBg()">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" :class="getIconBg()">
          {{ domainIcons[domain] }}
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ domain }}</h1>
          <p class="text-sm opacity-80 mt-1">{{ subs.length }} 个子方向</p>
        </div>
      </div>
    </div>

    <!-- 子分类卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <NuxtLink
        v-for="sub in subs"
        :key="sub"
        :to="`/knowledge/${encodeURIComponent(domain)}/${encodeURIComponent(sub)}`"
        class="card-hover p-4 text-center"
      >
        <p class="font-medium text-gray-700">{{ sub }}</p>
        <p class="text-xs text-gray-400 mt-1">进入查看笔记 →</p>
      </NuxtLink>
    </div>

    <!-- 领域最新笔记 -->
    <div>
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full" style="background: var(--sakura-gradient);"></span>
        📝 {{ domain }} 领域最新笔记
      </h2>
      <div v-if="notes.length" class="space-y-2">
        <NuxtLink
          v-for="n in notes"
          :key="n.id"
          :to="`/notes/${n.slug}`"
          class="card-hover p-4 flex items-center gap-3"
        >
          <span class="text-xl">📄</span>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-800">{{ n.title }}</h4>
            <p class="text-xs text-gray-500 mt-1">
              {{ n.subcategory }} · {{ n.author_nick || n.author_name }} · {{ formatDate(n.created_at) }}
            </p>
          </div>
        </NuxtLink>
      </div>
      <p v-else class="card p-8 text-center text-gray-400">暂无笔记</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const domain = decodeURIComponent(route.params.domain as string)

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

const subs = computed(() => allDomains[domain] || [])
const notes = ref<any[]>([])
const domainIcons: Record<string, string> = {
  '安全': '🔒', '开发': '💻', '设计': '🎨', '理学': '🔬',
  '工学': '⚙️', '医学': '🏥', '交叉新兴': '🧬', '外语': '🌐',
  '经济学': '💰', '管理学': '📊', '职业技能': '💼', '通识': '📚'
}

onMounted(async () => {
  try {
    const res = await useApi<any>(`/api/notes?domain=${encodeURIComponent(domain)}&size=10`)
    if (res.code === 200) notes.value = res.data.list
  } catch {}
})

function formatDate(d: string) { return d?.replace('T', ' ').slice(0, 16) || '' }
function getHeaderBg() {
  const c: Record<string, string> = {
    '安全': 'bg-gradient-to-r from-red-100 to-pink-100',
    '开发': 'bg-gradient-to-r from-blue-100 to-indigo-100',
    '设计': 'bg-gradient-to-r from-purple-100 to-pink-100',
    '理学': 'bg-gradient-to-r from-green-100 to-emerald-100',
    '工学': 'bg-gradient-to-r from-orange-100 to-amber-100',
    '医学': 'bg-gradient-to-r from-pink-100 to-rose-100',
    '交叉新兴': 'bg-gradient-to-r from-indigo-100 to-purple-100',
    '外语': 'bg-gradient-to-r from-cyan-100 to-blue-100',
    '经济学': 'bg-gradient-to-r from-yellow-100 to-amber-100',
    '管理学': 'bg-gradient-to-r from-teal-100 to-cyan-100',
    '职业技能': 'bg-gradient-to-r from-gray-100 to-slate-100',
    '通识': 'bg-gradient-to-r from-amber-100 to-yellow-100'
  }
  return c[domain] || 'bg-sakura-50'
}
function getIconBg() {
  const c: Record<string, string> = {
    '安全': 'bg-red-100', '开发': 'bg-blue-100', '设计': 'bg-purple-100',
    '理学': 'bg-green-100', '工学': 'bg-orange-100', '医学': 'bg-pink-100',
    '交叉新兴': 'bg-indigo-100', '外语': 'bg-cyan-100', '经济学': 'bg-yellow-100',
    '管理学': 'bg-teal-100', '职业技能': 'bg-gray-100', '通识': 'bg-amber-100'
  }
  return c[domain] || 'bg-white'
}
</script>
