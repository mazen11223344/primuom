import fs from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

const dataDir = path.join(process.cwd(), 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const hasKV = Boolean(process.env.KV_REST_API_URL)

async function readFromFile<T>(filename: string, defaultValue: T): Promise<T> {
  const filePath = path.join(dataDir, filename)
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
  }
  return defaultValue
}

async function writeToFile<T>(filename: string, data: T) {
  const filePath = path.join(dataDir, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
  }
}

export async function readData<T>(key: string, filename: string, defaultValue: T): Promise<T> {
  if (hasKV) {
    try {
      const data = await kv.get<T>(key)
      if (data !== null && data !== undefined) {
        return data
      }
    } catch (error) {
      console.error(`Error reading key ${key} from KV:`, error)
    }
  }
  return readFromFile(filename, defaultValue)
}

export async function writeData<T>(key: string, filename: string, data: T): Promise<void> {
  if (hasKV) {
    try {
      await kv.set(key, data)
      return
    } catch (error) {
      console.error(`Error writing key ${key} to KV:`, error)
    }
  }
  await writeToFile(filename, data)
}


