import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const supportFile = path.join(dataDir, 'support.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function readSupportTickets(): any[] {
  try {
    if (fs.existsSync(supportFile)) {
      const data = fs.readFileSync(supportFile, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading support tickets:', error)
  }
  return []
}

function writeSupportTickets(tickets: any[]) {
  try {
    fs.writeFileSync(supportFile, JSON.stringify(tickets, null, 2))
  } catch (error) {
    console.error('Error writing support tickets:', error)
  }
}

export async function GET() {
  const tickets = readSupportTickets()
  return NextResponse.json(tickets)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'create') {
    const tickets = readSupportTickets()
    const ticket = {
      ...data,
      id: Date.now().toString(),
      status: 'open',
      createdAt: new Date().toISOString()
    }
    tickets.push(ticket)
    writeSupportTickets(tickets)
    return NextResponse.json({ success: true, ticket })
  }

  if (action === 'reply') {
    const { ticketId, adminReply } = data
    const tickets = readSupportTickets()
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)
    if (ticketIndex !== -1) {
      tickets[ticketIndex].adminReply = adminReply
      tickets[ticketIndex].status = 'closed'
      tickets[ticketIndex].repliedAt = new Date().toISOString()
      writeSupportTickets(tickets)
      return NextResponse.json({ success: true, ticket: tickets[ticketIndex] })
    }
    return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}

