import fs from 'node:fs'
import path from 'node:path'
import { ok } from '~/server/utils/response'

export default defineEventHandler(() => {
  const dir = path.join(process.cwd(), 'public', 'wallpapers')
  if (!fs.existsSync(dir)) return ok([])
  
  const files = fs.readdirSync(dir)
    .filter((f: string) => /^\d+\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort((a: string, b: string) => parseInt(a) - parseInt(b))
    .map((f: string) => '/wallpapers/' + f)
  
  return ok(files)
})