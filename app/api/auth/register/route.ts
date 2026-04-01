import 'dotenv/config';
import { generateToken, hashPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { Role } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, teamCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: 'Nome, email e password são obrigatórios',
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Usuário com este email já existe',
        },
        { status: 409 },
      );
    }

    let teamId: string | undefined;

    if (teamCode) {
      const team = await prisma.team.findUnique({
        where: { code: teamCode },
      });

      if (!team) {
        return NextResponse.json(
          {
            error: 'Por favor, entre com um código de time válido',
          },
          { status: 400 },
        );
      }

      teamId = team.id;
    }

    const hashedPassword = await hashPassword(password);

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        teamId,
      },
      include: {
        team: true,
      },
    });

    const token = generateToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        team: user.team,
        token,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Falha ao registrar Usuário:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}

// https://www.youtube.com/watch?v=b05ky3LdzKU
// Parei em 0:47:00
