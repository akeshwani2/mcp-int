import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Extract id from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      )
    }
    
    // Get the prisma client instance and delete the server
    const prismaClient = await prisma
    await prismaClient.mCPServer.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting server:', error)
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    )
  }
} 