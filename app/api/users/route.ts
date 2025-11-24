import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const usersFile = path.join(dataDir, 'users.json')

// إنشاء مجلد data إذا لم يكن موجوداً
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// قراءة البيانات
function readUsers() {
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users:', error)
  }
  return []
}

// كتابة البيانات
function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error writing users:', error)
  }
}

export async function GET() {
  const users = readUsers()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    writeUsers(data.users)
    return NextResponse.json({ success: true })
  }

  if (action === 'updateBalance') {
    const { userId, balance, updateDepositDate } = data
    const users = readUsers()
    const userIndex = users.findIndex((u: any) => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex].balance = balance
      if (updateDepositDate) {
        users[userIndex].lastDepositDate = new Date().toISOString().split('T')[0]
        users[userIndex].pendingDeposit = false
      }
      writeUsers(users)
      return NextResponse.json({ success: true, user: users[userIndex] })
    }
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  if (action === 'updateWithdrawalPeriod') {
    const { userId, withdrawalPeriod } = data
    const users = readUsers()
    const userIndex = users.findIndex((u: any) => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex].withdrawalPeriod = withdrawalPeriod
      writeUsers(users)
      return NextResponse.json({ success: true, user: users[userIndex] })
    }
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}

