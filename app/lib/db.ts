import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`Select 1`;
    return true;
  } catch (error) {
    console.error(`Falha ao conectar ao banco de dados: ${error}`);
    return false;
  }
}

export { prisma };
