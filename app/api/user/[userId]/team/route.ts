import { checkUserPermission, getCurrentUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { Role } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const user = await getCurrentUser();

    if (!user || !checkUserPermission(user, Role.ADMIN)) {
      return NextResponse.json(
        { error: 'Você não está autorizado a atualizar o time' },
        { status: 401 },
      );
    }

    const { teamId } = await request.json();

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return NextResponse.json(
          { error: 'Time não encontrado' },
          { status: 404 },
        );
      }
    }

    // Update user's team assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { teamId: teamId },
      include: { team: true },
    });

    return NextResponse.json({
      user: updatedUser,
      message: teamId
        ? 'Usuário incluído no time com sucesso'
        : 'Usuário removido do time com sucesso',
    });
  } catch (error) {
    console.error('Falha ao atualizar o time do usuário:', error);

    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
