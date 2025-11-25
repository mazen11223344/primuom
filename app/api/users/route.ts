import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'
import type { UserData } from '@/lib/auth'

const USERS_KEY = 'users'
const USERS_FILE = 'users.json'
const PASSWORDS_KEY = 'passwords'
const PASSWORDS_FILE = 'passwords.json'

async function readUsers(): Promise<UserData[]> {
  return readData<UserData[]>(USERS_KEY, USERS_FILE, [] as UserData[])
}

async function writeUsers(users: UserData[]): Promise<void> {
  await writeData<UserData[]>(USERS_KEY, USERS_FILE, users)
}

async function readPasswords(): Promise<Record<string, string>> {
  return readData<Record<string, string>>(PASSWORDS_KEY, PASSWORDS_FILE, {})
}

async function writePasswords(passwords: Record<string, string>): Promise<void> {
  await writeData<Record<string, string>>(PASSWORDS_KEY, PASSWORDS_FILE, passwords)
}

export async function GET() {
  const users = await readUsers()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    await writeUsers(data.users)
    return NextResponse.json({ success: true })
  }

  if (action === 'updateBalance') {
    const { userId, balance, updateDepositDate } = data
    const users = await readUsers()
    const userIndex = users.findIndex((u: any) => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex].balance = balance
      if (updateDepositDate) {
        users[userIndex].lastDepositDate = new Date().toISOString().split('T')[0]
        users[userIndex].pendingDeposit = false
      }
      await writeUsers(users)
      return NextResponse.json({ success: true, user: users[userIndex] })
    }
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  if (action === 'updateWithdrawalPeriod') {
    const { userId, withdrawalPeriod } = data
    const users = await readUsers()
    const userIndex = users.findIndex((u: any) => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex].withdrawalPeriod = withdrawalPeriod
      await writeUsers(users)
      return NextResponse.json({ success: true, user: users[userIndex] })
    }
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  if (action === 'delete') {
    const { userId } = data
    const users = await readUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    users.splice(userIndex, 1)
    await writeUsers(users)

    const passwords = await readPasswords()
    if (passwords[userId]) {
      delete passwords[userId]
      await writePasswords(passwords)
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}

