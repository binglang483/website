/**
 * 种子数据：默认管理员 + 默认分类
 */
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

export function seedDefaultUsers(db: Database.Database) {
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
  if (exists) return
  const hash = bcrypt.hashSync('admin123', 10)
  db.prepare(`
    INSERT INTO users (username, password, nickname, role, email)
    VALUES (?, ?, ?, 'admin', 'admin@sakura.local')
  `).run('admin', hash, '🌸 管理员')
  console.log('[seed] 创建默认管理员: admin / admin123')
}

export function seedDefaultCategories(db: Database.Database) {
  const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }
  if (catCount.c > 0) return

  const defaultCats: [string, string, string][] = [
    ['安全', '逆向工程', '🔒'], ['安全', '漏洞分析', '🛡️'], ['安全', '漏洞利用', '💥'],
    ['安全', '病毒分析', '🦠'], ['安全', '加壳脱壳', '📦'], ['安全', 'CTF竞赛', '🏆'],
    ['安全', '渗透测试', '🎯'], ['安全', '安全工具开发', '🛠️'],
    ['开发', '前端开发', '🎨'], ['开发', '后端开发', '⚙️'], ['开发', '移动端开发', '📱'],
    ['开发', '游戏开发', '🎮'], ['开发', '嵌入式/物联网', '🔌'], ['开发', '桌面应用', '🖥️'],
    ['开发', '数据库管理', '🗄️'], ['开发', '云原生与DevOps', '☁️'],
    ['设计', '平面设计', '🖌️'], ['设计', 'UI/UX设计', '✨'], ['设计', '3D设计与建模', '🧊'],
    ['设计', '视频与动效', '🎬'], ['设计', '游戏美术', '🎭'], ['设计', '工业设计', '🏭'],
    ['理学', '数学', '📐'], ['理学', '物理学', '⚛️'], ['理学', '化学', '🧪'],
    ['理学', '天文学', '🌌'], ['理学', '地理科学', '🌍'], ['理学', '生物科学', '🧬'],
    ['工学', '计算机与电子信息', '💾'], ['工学', '机械与能源动力', '🔧'], ['工学', '土木建筑水利', '🏗️'],
    ['工学', '材料化工', '🧱'], ['工学', '航空航天兵器', '🚀'], ['工学', '交通运输', '🚗'],
    ['医学', '基础医学', '🧫'], ['医学', '临床医学', '🩺'], ['医学', '药学', '💊'],
    ['医学', '公共卫生', '🏥'], ['医学', '生物医学工程', '🔬'],
    ['交叉新兴', '大数据/AI/区块链', '🤖'], ['交叉新兴', '新能源/储能', '🔋'], ['交叉新兴', '半导体/芯片', '💿'],
    ['交叉新兴', '生物医学/合成生物', '🧬'], ['交叉新兴', '智能制造/机器人', '🦾'], ['交叉新兴', '量子信息/计算', '⚛️'],
    ['外语', '英语', '🇬🇧'], ['外语', '日语', '🇯🇵'], ['外语', '韩语', '🇰🇷'], ['外语', '翻译学', '📖'],
    ['经济学', '理论经济', '📊'], ['经济学', '金融学', '💰'], ['经济学', '国际贸易', '🌐'],
    ['经济学', '数字经济', '💳'],
    ['管理学', '工商管理', '📋'], ['管理学', '公共管理', '🏛️'], ['管理学', '管理科学与工程', '📈'],
    ['职业技能', '产品/策划', '💡'], ['职业技能', '运营/市场', '📢'], ['职业技能', '研发管理', '👨‍💻'],
    ['职业技能', '人力资源', '👥'], ['职业技能', '财务/会计', '📑'], ['职业技能', '销售', '🛒'],
    ['通识', '学习方法', '📚'], ['通识', '工具效率', '⚡'], ['通识', '资源分享', '🎁'],
  ]
  const insert = db.prepare('INSERT INTO categories (domain, name, icon) VALUES (?, ?, ?)')
  const batch = db.transaction((cats: [string, string, string][]) => {
    for (const c of cats) insert.run(c[0], c[1], c[2])
  })
  batch(defaultCats)
  console.log(`[seed] 初始化 ${defaultCats.length} 个默认分类`)
}
