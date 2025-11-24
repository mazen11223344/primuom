import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'

const USERS_KEY = 'users'
const USERS_FILE = 'users.json'

async function readUsers() {
  return readData(USERS_KEY, USERS_FILE, [])
}

async function writeUsers(users: any[]) {
  await writeData(USERS_KEY, USERS_FILE, users)
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

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}

