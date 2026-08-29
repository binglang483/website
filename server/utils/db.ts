import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import fs from 'node:fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const config = useRuntimeConfig()
  const dbPath = config.dbPath

  // 确保目录存在
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initSchema(db)
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      nickname TEXT,
      avatar TEXT,
      bio TEXT,
      role TEXT DEFAULT 'user',
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      author_id INTEGER NOT NULL,
      category TEXT,
      visibility TEXT DEFAULT 'public',
      view_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      content TEXT NOT NULL,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (article_id) REFERENCES articles(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (parent_id) REFERENCES comments(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      domain TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      domain TEXT NOT NULL,
      subcategory TEXT,
      author_id INTEGER NOT NULL,
      visibility TEXT DEFAULT 'public',
      view_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_notes_domain ON notes(domain, subcategory);
    CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
    CREATE INDEX IF NOT EXISTS idx_documents_domain ON documents(domain, subcategory);
    CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author_id);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `)

  // 初始化默认管理员（如果不存在）
  const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number }
  if (adminCount.c === 0) {
    db.prepare(`
      INSERT INTO users (username, password, email, nickname, role)
      VALUES (?, ?, ?, ?, 'admin')
    `).run('admin', bcrypt.hashSync('admin123', 10), 'admin@example.com', '庭の管理人')
  }

  // 初始化默认分类数据
  const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }
  if (catCount.c === 0) {
    const defaultCats = [
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
    const batch = db.transaction((cats: any[][]) => {
      for (const c of cats) insert.run(c[0], c[1], c[2])
    })
    batch(defaultCats)
  }
}
