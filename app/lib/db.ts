import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error(`Falha ao conectar ao banco de dados: ${error}`);
    return false;
  }
}
