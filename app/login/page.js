'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRegistro() {
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = esRegistro ? '/api/auth/registro' : '/api/auth/login';
        const body = esRegistro ? { nombre, email, password } : { email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ocurrió un error');
            }

            localStorage.setItem('usuario', JSON.stringify(data));

            router.push('/');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-white">
            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
                    {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {esRegistro && (
                        <input
                            type="text"
                            placeholder="Tu Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-neutral-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-neutral-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-neutral-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-neutral-950 font-bold py-3 rounded-lg hover:bg-green-400 transition"
                    >
                        {esRegistro ? 'Registrarme' : 'Entrar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-neutral-400 text-sm">
                    {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => {
                            setEsRegistro(!esRegistro);
                            setError('');
                        }}
                        className="text-green-400 font-semibold ml-2 hover:underline"
                    >
                        {esRegistro ? 'Inicia Sesión' : 'Regístrate'}
                    </button>
                </p>
            </div>
        </div>
    );
}