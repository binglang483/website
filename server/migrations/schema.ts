/**
 * Schema 初始化 + 历史迁移
 * 所有建表、ALTER、旧结构迁移放这里
 */
import Database from 'better-sqlite3'

/** 安全地给表加列（列已存在则跳过） */
export function ensureColumn(db: Database.Database, table: string, column: string, def: string) {
  const cols = db.pragma(`table_info(${table})`) as { name: string }[]
  const exists = cols.some(c => c.name === column)
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`)
    console.log(`  [migration] 给 ${table} 增加列 ${column}`)
  }
}

/** 迁移旧 comments 表（article_id → polymorphic） */
function migrateCommentsTable(db: Database.Database) {
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comments'"
  ).get()
  if (!tableExists) return

  const cols = db.pragma('table_info(comments)') as { name: string }[]
  const hasOldArticleId = cols.some(c => c.name === 'article_id')
  const hasNewType = cols.some(c => c.name === 'commentable_type')

  if (hasOldArticleId && !hasNewType) {
    console.log('[migration] 检测到旧版 comments 表结构，开始迁移...')
    db.exec('ALTER TABLE comments RENAME TO comments_old')
    db.exec(`
      CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commentable_type TEXT NOT NULL,
        commentable_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        parent_id INTEGER,
        content TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES comments(id)
      )
    `)
    db.exec(`
      INSERT INTO comments (id, commentable_type, commentable_id, user_id, parent_id, content, status, created_at)
      SELECT id, 'article', article_id, user_id, parent_id, content, status, created_at
      FROM comments_old
    `)
    db.exec('DROP TABLE comments_old')
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_comments_polymorphic ON comments(commentable_type, commentable_id);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
    `)
    console.log('[migration] comments 表迁移完成 ✅')
  }
}

/** 执行所有 schema 初始化 + 迁移 */
export function runSchemaMigrations(db: Database.Database) {
  migrateCommentsTable(db)

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
      commentable_type TEXT NOT NULL,
      commentable_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      parent_id INTEGER,
      content TEXT NOT NULL,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
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
      comment_count INTEGER DEFAULT 0,
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
      comment_count INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS fs_seed_meta (
      path TEXT PRIMARY KEY,
      mtime INTEGER NOT NULL,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_polymorphic ON comments(commentable_type, commentable_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_notes_domain ON notes(domain, subcategory);
    CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
    CREATE INDEX IF NOT EXISTS idx_documents_domain ON documents(domain, subcategory);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `)

  // 给旧库补 comment_count 列
  ensureColumn(db, 'notes', 'comment_count', 'INTEGER DEFAULT 0')
  ensureColumn(db, 'documents', 'comment_count', 'INTEGER DEFAULT 0')
}
