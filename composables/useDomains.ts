/**
 * 领域数据统一管理 composable
 * 解决 pages/notes/new.vue 和 pages/notes/index.vue 中硬编码重复的问题
 */

export interface DomainInfo {
  name: string
  icon: string
  bgColor: string
}

// 12 大领域定义
const domainList: DomainInfo[] = [
  { name: '安全', icon: '🔒', bgColor: '#fff1f1' },
  { name: '开发', icon: '💻', bgColor: '#e8f4ff' },
  { name: '设计', icon: '🎨', bgColor: '#f3e8ff' },
  { name: '理学', icon: '🔬', bgColor: '#ecfdf5' },
  { name: '工学', icon: '⚙️', bgColor: '#fff7ed' },
  { name: '医学', icon: '🏥', bgColor: '#fdf2f8' },
  { name: '交叉新兴', icon: '🧬', bgColor: '#eef2ff' },
  { name: '外语', icon: '🌐', bgColor: '#ecfeff' },
  { name: '经济学', icon: '💰', bgColor: '#fefce8' },
  { name: '管理学', icon: '📊', bgColor: '#f0fdfa' },
  { name: '职业技能', icon: '💼', bgColor: '#f9fafb' },
  { name: '通识', icon: '📚', bgColor: '#fffbeb' },
]

// 领域 → 子分类映射（与 server/utils/db.ts 初始化数据保持一致）
const subcategoryMap: Record<string, string[]> = {
  '安全': ['逆向工程', '漏洞分析', '漏洞利用', '病毒分析', '加壳脱壳', 'CTF竞赛', '渗透测试', '安全工具开发'],
  '开发': ['前端开发', '后端开发', '移动端开发', '游戏开发', '嵌入式/物联网', '桌面应用', '数据库管理', '云原生与DevOps'],
  '设计': ['平面设计', 'UI/UX设计', '3D设计与建模', '视频与动效', '游戏美术', '工业设计'],
  '理学': ['数学', '物理学', '化学', '天文学', '地理科学', '生物科学'],
  '工学': ['计算机与电子信息', '机械与能源动力', '土木建筑水利', '材料化工', '航空航天兵器', '交通运输'],
  '医学': ['基础医学', '临床医学', '药学', '公共卫生', '生物医学工程'],
  '交叉新兴': ['大数据/AI/区块链', '新能源/储能', '半导体/芯片', '生物医学/合成生物', '智能制造/机器人', '量子信息/计算'],
  '外语': ['英语', '日语', '韩语', '翻译学'],
  '经济学': ['理论经济', '金融学', '国际贸易', '数字经济'],
  '管理学': ['工商管理', '公共管理', '管理科学与工程'],
  '职业技能': ['产品/策划', '运营/市场', '研发管理', '人力资源', '财务/会计', '销售'],
  '通识': ['学习方法', '工具效率', '资源分享'],
}

export function useDomains() {
  /** 获取所有领域名称列表 */
  const domainNames = domainList.map(d => d.name)

  /** 按名称获取领域信息 */
  function getDomain(name: string): DomainInfo | undefined {
    return domainList.find(d => d.name === name)
  }

  /** 获取领域图标 */
  function getIcon(name?: string): string {
    if (!name) return '📄'
    return getDomain(name)?.icon || '📄'
  }

  /** 获取领域背景色 */
  function getBgColor(name?: string): string {
    if (!name) return '#f3f4f6'
    return getDomain(name)?.bgColor || '#f3f4f6'
  }

  /** 获取子分类列表 */
  function getSubcategories(domain: string): string[] {
    return subcategoryMap[domain] || []
  }

  /** 领域图标映射（直接用） */
  const iconMap: Record<string, string> = Object.fromEntries(
    domainList.map(d => [d.name, d.icon])
  )

  /** 领域背景色映射 */
  const bgColorMap: Record<string, string> = Object.fromEntries(
    domainList.map(d => [d.name, d.bgColor])
  )

  return {
    domainList,
    domainNames,
    iconMap,
    bgColorMap,
    getDomain,
    getIcon,
    getBgColor,
    getSubcategories,
    subcategoryMap,
  }
}
