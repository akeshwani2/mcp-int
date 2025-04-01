// ESM for importing Prisma in Next.js

// Use dynamic import to avoid issues with module resolution at build time
let PrismaClient: any;
let prisma: any;

// Initialize PrismaClient
async function initPrisma() {
  try {
    // Dynamically import PrismaClient
    const module = await import('@prisma/client');
    PrismaClient = module.PrismaClient;
    
    // Check if we already have an instance of PrismaClient
    // @ts-ignore
    if (!global.prisma) {
      // @ts-ignore
      global.prisma = new PrismaClient();
    }
    
    // @ts-ignore
    prisma = global.prisma;
    return prisma;
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error);
    // Return a mock Prisma client that logs errors
    return createMockPrisma();
  }
}

// Create a mock Prisma client that logs errors
function createMockPrisma() {
  return new Proxy({}, {
    get: function(target, prop) {
      if (typeof prop === 'string') {
        return new Proxy({}, {
          get: function() {
            return () => {
              console.error(`Prisma client not initialized. Method ${String(prop)} called.`);
              return Promise.reject(new Error('Prisma client not initialized'));
            };
          }
        });
      }
      return undefined;
    }
  });
}

// Initialize singleton
const prismaPromise = initPrisma();

// Export the promise that resolves to the Prisma client
export { prismaPromise as prisma }; 