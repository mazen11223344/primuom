import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'
import type { WithdrawalRequest } from '@/lib/auth'

const WITHDRAWALS_KEY = 'withdrawals'
const WITHDRAWALS_FILE = 'withdrawals.json'

async function readWithdrawals(): Promise<WithdrawalRequest[]> {
  return readData<WithdrawalRequest[]>(WITHDRAWALS_KEY, WITHDRAWALS_FILE, [] as WithdrawalRequest[])
}

async function writeWithdrawals(withdrawals: WithdrawalRequest[]): Promise<void> {
  await writeData<WithdrawalRequest[]>(WITHDRAWALS_KEY, WITHDRAWALS_FILE, withdrawals)
}

export async function GET() {
  const withdrawals = await readWithdrawals()
  return NextResponse.json(withdrawals)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    await writeWithdrawals(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'create') {
    const withdrawals = await readWithdrawals()
    withdrawals.push(data)
    await writeWithdrawals(withdrawals)
    return NextResponse.json({ success: true, withdrawal: data })
  }

  if (action === 'update') {
    const { withdrawalId, status } = data
    const withdrawals = await readWithdrawals()
    const withdrawalIndex = withdrawals.findIndex((w: any) => w.id === withdrawalId)
    if (withdrawalIndex !== -1) {
      withdrawals[withdrawalIndex].status = status
      await writeWithdrawals(withdrawals)
      return NextResponse.json({ success: true, withdrawal: withdrawals[withdrawalIndex] })
    }
    return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}




