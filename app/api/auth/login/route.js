import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        const usuarios = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
        if (usuarios.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const usuario = usuarios[0];

        const contraseñaValida = await bcrypt.compare(password, usuario.password);
        if (!contraseñaValida) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }

        return NextResponse.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}