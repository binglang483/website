import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runSchemaMigrations, ensureColumn } from '~/server/migrations/schema'

let db: Database.Database

beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
})

afterEach(() => { db.close() })

describe('schema migrations', () => {
  it('首次运行：创建全部表 + 索引', () => {
    runSchemaMigrations(db)

    const tables = (db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all() as { name: string }[]).map(r => r.name)

    expect(tables).toContain('users')
    expect(tables).toContain('documents')
    expect(tables).toContain('notes')
    expect(tables).toContain('comments')
    expect(tables).toContain('categories')
    expect(tables).toContain('fs_seed_meta')
    // articles 旧表保留兼容
    expect(tables).toContain('articles')
  })

  it('idempotent：重复运行不报错', () => {
    runSchemaMigrations(db)
    runSchemaMigrations(db)
    runSchemaMigrations(db)
    // 没抛出异常即通过
    expect(true).toBe(true)
  })

  it('comments 表结构：支持 polymorphic', () => {
    runSchemaMigrations(db)
    const cols = db.pragma('table_info(comments)') as { name: string }[]
    const names = cols.map(c => c.name)
    expect(names).toContain('commentable_type')
    expect(names).toContain('commentable_id')
    expect(names).toContain('parent_id')   // 楼中楼
  })

  it('ensureColumn：补列', () => {
    db.exec('CREATE TABLE t1 (a INTEGER)')
    ensureColumn(db, 't1', 'b', 'TEXT')
    const cols = db.pragma('table_info(t1)') as { name: string }[]
    expect(cols.map(c => c.name)).toContain('b')
  })

  it('ensureColumn：列已存在不报错', () => {
    db.exec('CREATE TABLE t2 (a INTEGER, b TEXT)')
    ensureColumn(db, 't2', 'b', 'TEXT')  // 已存在
    expect(true).toBe(true)
  })

  it('支持楼中楼评论插入', () => {
    runSchemaMigrations(db)
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('tester', 'hash')
    db.prepare(`
      INSERT INTO documents (slug, title, content, domain, subcategory, author_id)
      VALUES ('d1', '文档', 'body', '安全', '逆向', 1)
    `).run()

    const insert = db.prepare(`
      INSERT INTO comments (commentable_type, commentable_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?, ?)
    `)
    const root = insert.run('document', 1, 1, null, '根评论')
    const reply = insert.run('document', 1, 1, root.lastInsertRowid, '楼中楼回复')

    expect(root.lastInsertRowid).toBe(1)
    expect(reply.lastInsertRowid).toBe(2)
    const rows = db.prepare('SELECT * FROM comments ORDER BY id').all()
    expect(rows.length).toBe(2)
  })
})
