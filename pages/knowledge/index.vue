<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">📚 知识库</h1>
      <p class="text-sm text-gray-500 mt-1">12大领域 · 点击卡片进入对应领域的子分类</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="(subs, domain) in domains"
        :key="domain"
        :to="`/knowledge/${encodeURIComponent(domain)}`"
        class="card-hover p-5 block group"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition group-hover:scale-110" :class="getDomainBg(domain)">
            {{ domainIcons[domain] }}
          </div>
          <div>
            <h3 class="font-bold text-gray-800 group-hover:text-sakura-600">{{ domain }}</h3>
            <p class="text-xs text-gray-500">{{ subs.length }} 个子方向</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const domains: Record<string, string[]> = {
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
const domainIcons: Record<string, string> = {
  '安全': '🔒', '开发': '💻', '设计': '🎨', '理学': '🔬',
  '工学': '⚙️', '医学': '🏥', '交叉新兴': '🧬', '外语': '🌐',
  '经济学': '💰', '管理学': '📊', '职业技能': '💼', '通识': '📚'
}
function getDomainBg(d: string) {
  const c: Record<string, string> = {
    '安全': 'bg-red-100', '开发': 'bg-blue-100', '设计': 'bg-purple-100',
    '理学': 'bg-green-100', '工学': 'bg-orange-100', '医学': 'bg-pink-100',
    '交叉新兴': 'bg-indigo-100', '外语': 'bg-cyan-100', '经济学': 'bg-yellow-100',
    '管理学': 'bg-teal-100', '职业技能': 'bg-gray-100', '通识': 'bg-amber-100'
  }
  return c[d] || 'bg-sakura-100'
}
</script>
