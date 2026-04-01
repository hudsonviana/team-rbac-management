import { checkDatabaseConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Falha ao conectar ao banco de dados',
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      message: 'Banco de dados conectado com sucesso',
    },
    { status: 200 },
  );
}
