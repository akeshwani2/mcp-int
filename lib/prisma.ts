// ESM for importing Prisma in Next.js

// Import types only
import type { PrismaClient as PrismaClientType } from '@prisma/client'

// Extend global for properly typing
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined
}

// For Next.js compatibility, use a conditional dynamic import
let prismaInstance: PrismaClientType | undefined

async function getPrismaClient(): Promise<PrismaClientType> {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    prismaInstance = new PrismaClient()
    
    // Add to global in development to prevent multiple instances during hot reload
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prismaInstance
    }
  }
  
  return prismaInstance
}

// Export a function that returns the Prisma client
export const prisma = getPrismaClient() 