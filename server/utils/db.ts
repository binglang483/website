/**
 * 数据库连接管理（唯一入口）
 * 表结构：server/migrations/schema.ts
 * 种子数据：server/seed/*
 */
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { runSchemaMigrations } from '~/server/migrations/schema'
import { seedDefaultUsers, seedDefaultCategories } from '~/server/seed/admin'
import { seedDocumentsFromFilesystem } from '~/server/seed/documents'

let db: Database.Database | null = null
let initialized = false

export function getDb(): Database.Database {
  if (db && initialized) return db

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

  // 串行执行初始化
  runSchemaMigrations(db)
  seedDefaultUsers(db)
  seedDefaultCategories(db)
  seedDocumentsFromFilesystem(db)

  initialized = true
  return db
}
