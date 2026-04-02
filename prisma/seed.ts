import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';
import { hashPassword } from '@/app/lib/auth';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Iniciando database seed (upsert)...');

  // Create or update teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { code: 'ENG-2024' },
      update: {
        name: 'Engineering',
        description: 'Software development team',
      },
      create: {
        name: 'Engineering',
        description: 'Software development team',
        code: 'ENG-2024',
      },
    }),
    prisma.team.upsert({
      where: { code: 'MKT-2024' },
      update: {
        name: 'Marketing',
        description: 'Marketing and growth team',
      },
      create: {
        name: 'Marketing',
        description: 'Marketing and growth team',
        code: 'MKT-2024',
      },
    }),
    prisma.team.upsert({
      where: { code: 'HR-2024' },
      update: {
        name: 'HR',
        description: 'Human resources team',
      },
      create: {
        name: 'HR',
        description: 'Human resources team',
        code: 'HR-2024',
      },
    }),
  ]);

  const defaultPassword = await hashPassword('112233');

  // Create or update users
  const users = [
    {
      name: 'John Developer',
      email: 'john@company.com',
      teamId: teams[0].id,
      role: Role.MANAGER,
    },
    {
      name: 'Alice Engineer',
      email: 'alice@company.com',
      teamId: teams[0].id,
      role: Role.USER,
    },
    {
      name: 'Bob Marketer',
      email: 'bob@company.com',
      teamId: teams[1].id,
      role: Role.MANAGER,
    },
    {
      name: 'Carol Marketing',
      email: 'carol@company.com',
      teamId: teams[1].id,
      role: Role.USER,
    },
    {
      name: 'Dave HR',
      email: 'dave@company.com',
      teamId: teams[2].id,
      role: Role.MANAGER,
    },
    {
      name: 'Eve Recruiter',
      email: 'eve@company.com',
      teamId: teams[2].id,
      role: Role.USER,
    },
    {
      name: 'Super Admin',
      email: 'admin@company.com',
      teamId: null,
      role: Role.ADMIN,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        password: defaultPassword,
      },
      create: {
        email: user.email,
        name: user.name,
        password: defaultPassword,
        role: user.role,
        teamId: user.teamId,
      },
    });
  }

  console.log('✅ Database alimentada com sucesso (upsert)!');
}

main()
  .catch(async (error) => {
    console.error('❌ Falha no seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
