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
    const currentUser = await getCurrentUser();

    if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        { error: 'Você não está autorizado a atualizar a função' },
        { status: 401 },
      );
    }

    // Prevent users from changing their own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Você não está autorizado a atualizar a próprio função' },
        { status: 401 },
      );
    }

    const { role } = await request.json();

    // Validate role
    const validateRoles = [Role.USER, Role.MANAGER];

    if (!validateRoles.includes(role)) {
      return NextResponse.json(
        {
          error:
            'Função inválida ou você não pode ter mais do que a função de gerente ou usuário',
        },
        { status: 401 },
      );
    }

    // Update user's team assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      include: { team: true },
    });

    return NextResponse.json({
      user: updatedUser,
      message: `Função do usuário atualizada para ${role} com sucesso`,
    });
  } catch (error) {
    console.error('Falha ao atualizar a função do usuário:', error);

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
