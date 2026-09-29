import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el archivo .env.local');
}

export const sql = neon(process.env.DATABASE_URL);