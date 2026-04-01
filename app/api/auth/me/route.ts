import { getCurrentUser } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Você não está autenticado' },
        { status: 401 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}
