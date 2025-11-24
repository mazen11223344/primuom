import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const passwordsFile = path.join(dataDir, 'passwords.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function readPasswords(): Record<string, string> {
  try {
    if (fs.existsSync(passwordsFile)) {
      const data = fs.readFileSync(passwordsFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading passwords:', error)
  }
  return {}
}

function writePasswords(passwords: Record<string, string>) {
  try {
    fs.writeFileSync(passwordsFile, JSON.stringify(passwords, null, 2))
  } catch (error) {
    console.error('Error writing passwords:', error)
  }
}

export async function GET() {
  const passwords = readPasswords()
  return NextResponse.json(passwords)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    writePasswords(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'get') {
    const { userId } = data
    const passwords = readPasswords()
    return NextResponse.json({ password: passwords[userId] || null })
  }

  if (action === 'set') {
    const { userId, password } = data
    const passwords = readPasswords()
    passwords[userId] = password
    writePasswords(passwords)
    return NextResponse.json({ success: true })
  }

  if (action === 'verify') {
    const { userId, password } = data
    const passwords = readPasswords()
    return NextResponse.json({ valid: passwords[userId] === password })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}



