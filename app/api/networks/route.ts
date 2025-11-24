import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'
import type { DepositNetwork } from '@/lib/auth'

const NETWORKS_KEY = 'networks'
const NETWORKS_FILE = 'networks.json'
const DEFAULT_NETWORKS: DepositNetwork[] = [
  { id: '1', name: 'TRC20', address: '', enabled: true },
  { id: '2', name: 'ERC20', address: '', enabled: true },
  { id: '3', name: 'BEP20', address: '', enabled: true }
]

async function readNetworks(): Promise<DepositNetwork[]> {
  return readData<DepositNetwork[]>(NETWORKS_KEY, NETWORKS_FILE, DEFAULT_NETWORKS)
}

async function writeNetworks(networks: DepositNetwork[]): Promise<void> {
  await writeData<DepositNetwork[]>(NETWORKS_KEY, NETWORKS_FILE, networks)
}

export async function GET() {
  const networks = await readNetworks()
  return NextResponse.json(networks)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    await writeNetworks(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'update') {
    const { networkId, address } = data
    const networks = await readNetworks()
    const networkIndex = networks.findIndex((n: any) => n.id === networkId)
    if (networkIndex !== -1) {
      networks[networkIndex].address = address
      await writeNetworks(networks)
      return NextResponse.json({ success: true, network: networks[networkIndex] })
    }
    return NextResponse.json({ success: false, error: 'Network not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}




