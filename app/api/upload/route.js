import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'Nombre de archivo requerido' }, { status: 400 });
    }

    try {
        const blob = await put(filename, request.body, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}