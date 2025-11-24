import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const networksFile = path.join(dataDir, 'networks.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function readNetworks() {
  try {
    if (fs.existsSync(networksFile)) {
      const data = fs.readFileSync(networksFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading networks:', error)
  }
  // القيم الافتراضية
  return [
    { id: '1', name: 'TRC20', address: '', enabled: true },
    { id: '2', name: 'ERC20', address: '', enabled: true },
    { id: '3', name: 'BEP20', address: '', enabled: true }
  ]
}

function writeNetworks(networks: any[]) {
  try {
    fs.writeFileSync(networksFile, JSON.stringify(networks, null, 2))
  } catch (error) {
    console.error('Error writing networks:', error)
  }
}

export async function GET() {
  const networks = readNetworks()
  return NextResponse.json(networks)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'save') {
    writeNetworks(data)
    return NextResponse.json({ success: true })
  }

  if (action === 'update') {
    const { networkId, address } = data
    const networks = readNetworks()
    const networkIndex = networks.findIndex((n: any) => n.id === networkId)
    if (networkIndex !== -1) {
      networks[networkIndex].address = address
      writeNetworks(networks)
      return NextResponse.json({ success: true, network: networks[networkIndex] })
    }
    return NextResponse.json({ success: false, error: 'Network not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}



