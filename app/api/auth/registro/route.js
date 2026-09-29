import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { nombre, email, password } = await request.json();

        const existe = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
        if (existe.length > 0) {
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await sql`
            INSERT INTO usuarios (nombre, email, password)
            VALUES (${nombre}, ${email}, ${hashedPassword})
            RETURNING id, nombre, email
        `;

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}