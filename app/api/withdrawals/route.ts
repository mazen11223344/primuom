import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const withdrawalsFile = path.join(dataDir, 'withdrawals.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function readWithdrawals() {
  try {
    if (fs.existsSync(withdrawalsFile)) {
      const data = fs.readFileSync(withdrawalsFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading withdrawals:', error)
  }
  return []
}

function writeWithdrawals(withdrawals: any[]) {
  try {
    fs.writeFileSync(withdrawalsFile, JSON.stringify(withdrawals, null, 2))
  } catch (error) {
    console.error('Error writing withdrawals:', error)
  }
}

export async function GET() {
  const withdrawals = readWithdrawals()
  return NextResponse.json(withdrawals)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    writeWithdrawals(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'create') {
    const withdrawals = readWithdrawals()
    withdrawals.push(data)
    writeWithdrawals(withdrawals)
    return NextResponse.json({ success: true, withdrawal: data })
  }

  if (action === 'update') {
    const { withdrawalId, status } = data
    const withdrawals = readWithdrawals()
    const withdrawalIndex = withdrawals.findIndex((w: any) => w.id === withdrawalId)
    if (withdrawalIndex !== -1) {
      withdrawals[withdrawalIndex].status = status
      writeWithdrawals(withdrawals)
      return NextResponse.json({ success: true, withdrawal: withdrawals[withdrawalIndex] })
    }
    return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}



