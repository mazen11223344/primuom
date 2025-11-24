import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/storage'
import type { SupportTicket } from '@/lib/auth'

const SUPPORT_KEY = 'support_tickets'
const SUPPORT_FILE = 'support.json'

async function readSupportTickets(): Promise<SupportTicket[]> {
  return readData<SupportTicket[]>(SUPPORT_KEY, SUPPORT_FILE, [] as SupportTicket[])
}

async function writeSupportTickets(tickets: SupportTicket[]): Promise<void> {
  await writeData<SupportTicket[]>(SUPPORT_KEY, SUPPORT_FILE, tickets)
}

export async function GET() {
  const tickets = await readSupportTickets()
  return NextResponse.json(tickets)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'create') {
    const tickets = await readSupportTickets()
    const ticket = {
      ...data,
      id: Date.now().toString(),
      status: 'open',
      createdAt: new Date().toISOString()
    }
    tickets.push(ticket)
    await writeSupportTickets(tickets)
    return NextResponse.json({ success: true, ticket })
  }

  if (action === 'reply') {
    const { ticketId, adminReply } = data
    const tickets = await readSupportTickets()
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)
    if (ticketIndex !== -1) {
      tickets[ticketIndex].adminReply = adminReply
      tickets[ticketIndex].status = 'closed'
      tickets[ticketIndex].repliedAt = new Date().toISOString()
      await writeSupportTickets(tickets)
      return NextResponse.json({ success: true, ticket: tickets[ticketIndex] })
    }
    return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
}


