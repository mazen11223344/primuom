import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'

const PASSWORDS_KEY = 'passwords'
const PASSWORDS_FILE = 'passwords.json'

async function readPasswords(): Promise<Record<string, string>> {
  return readData(PASSWORDS_KEY, PASSWORDS_FILE, {})
}

async function writePasswords(passwords: Record<string, string>) {
  await writeData(PASSWORDS_KEY, PASSWORDS_FILE, passwords)
}

export async function GET() {
  const passwords = await readPasswords()
  return NextResponse.json(passwords)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    await writePasswords(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'get') {
    const { userId } = data
    const passwords = await readPasswords()
    return NextResponse.json({ password: passwords[userId] || null })
  }

  if (action === 'set') {
    const { userId, password } = data
    const passwords = await readPasswords()
    passwords[userId] = password
    await writePasswords(passwords)
    return NextResponse.json({ success: true })
  }

  if (action === 'verify') {
    const { userId, password } = data
    const passwords = await readPasswords()
    return NextResponse.json({ valid: passwords[userId] === password })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}




