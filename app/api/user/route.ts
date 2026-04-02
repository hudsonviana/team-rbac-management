import { getCurrentUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { Prisma, Role } from '@/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Você não está autorizado a acessar as informações dos usuários',
        },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const teamId = searchParams.get('teamId');
    const role = searchParams.get('role') as Role | null;

    // Build where clause based on the role
    const where: Prisma.UserWhereInput = {};

    if (user.role === Role.ADMIN) {
      // ADMIN pode ver tudo
    } else if (user.role === Role.MANAGER) {
      // Manager pode ver o seu time e os usuários regulares, mas não outros managers ou admins
      where.OR = [{ teamId: user.teamId }, { role: Role.USER }];
    } else {
      // Usuário regular pode ver somente o seu time
      where.teamId = user.teamId;
      where.role = { not: Role.ADMIN };
    }

    // Filtros adicionais
    if (teamId) where.teamId = teamId;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Falha ao consultar usuários:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
