import 'dotenv/config';
import { generateToken, verifyPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email e senha são obrigatórios',
        },
        { status: 400 },
      );
    }

    const userFromDb = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!userFromDb) {
      return NextResponse.json(
        {
          error: 'Credenciais inválidas',
        },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, userFromDb.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: 'Credenciais inválidas',
        },
        { status: 401 },
      );
    }

    const token = generateToken(userFromDb.id);

    const response = NextResponse.json({
      user: {
        id: userFromDb.id,
        email: userFromDb.email,
        name: userFromDb.name,
        role: userFromDb.role,
        teamId: userFromDb.teamId,
        team: userFromDb.team,
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
    console.error('Falha ao fazer login:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}
