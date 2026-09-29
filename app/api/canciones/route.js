import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    try {
        const canciones = await sql`SELECT * FROM canciones ORDER BY creado_en DESC`;
        return NextResponse.json(canciones);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { titulo, artista, url_archivo } = body;

        const result = await sql`
      INSERT INTO canciones (titulo, artista, url_archivo)
      VALUES (${titulo}, ${artista}, ${url_archivo})
      RETURNING *
    `;

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}