// Use CommonJS style require to avoid ESM issues with Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

// Type definition for IDE support only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientType = any

// Declare global to prevent multiple instances
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined
}

// Create prisma client if it doesn't exist already
const prisma = global.prisma || new PrismaClient()

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma } 