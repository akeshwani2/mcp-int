import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  try {
    // Get session ID from cookies
    const cookieStore = await cookies()
    let sessionId = cookieStore.get('sessionId')?.value
    
    if (!sessionId) {
      sessionId = uuidv4()
      cookieStore.set('sessionId', sessionId, { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/' 
      })
    }
    
    // Get all servers for this session
    const servers = await prisma.mCPServer.findMany({
      where: { sessionId },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, transport, command, args, url } = data
    
    // Get session ID
    const cookieStore = await cookies()
    let sessionId = cookieStore.get('sessionId')?.value
    
    if (!sessionId) {
      sessionId = uuidv4()
      cookieStore.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })
    }
    
    // Create a new server
    const server = await prisma.mCPServer.create({
      data: {
        name,
        transport,
        command: transport === 'stdio' ? command : null,
        args: transport === 'stdio' && args ? JSON.stringify(args) : null,
        url: transport === 'sse' ? url : null,
        sessionId,
        lastUsed: new Date()
      }
    })
    
    return NextResponse.json(server)
  } catch (error) {
    console.error('Error creating server:', error)
    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    )
  }
} 