'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Reproductor() {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);
    const [usuario, setUsuario] = useState(null);

    const [canciones, setCanciones] = useState([]);
    const [cancionActual, setCancionActual] = useState(null);
    const audioRef = useRef(null);

    const [titulo, setTitulo] = useState('');
    const [artista, setArtista] = useState('');
    const [archivoFisico, setArchivoFisico] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        // 1. Verificamos si existe la sesión en el navegador
        const usuarioGuardado = localStorage.getItem('usuario');

        if (!usuarioGuardado) {
            // Si no hay sesión, lo regresamos al login de inmediato
            router.push('/login');
        } else {
            // Si hay sesión, guardamos sus datos, damos permiso y cargamos las canciones
            setUsuario(JSON.parse(usuarioGuardado));
            setAutorizado(true);

            fetch('/api/canciones')
                .then(async (res) => {
                    if (!res.ok) throw new Error('Error de conexión');
                    return res.json();
                })
                .then((data) => {
                    if (Array.isArray(data)) setCanciones(data);
                })
                .catch((err) => console.error(err));
        }
    }, [router]);

    // Función para salir
    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        router.push('/login');
    };

    const reproducir = (cancion) => {
        setCancionActual(cancion);
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play();
        }, 100);
    };

    const subirCancion = async (e) => {
        e.preventDefault();
        if (!archivoFisico || !titulo) return alert("Falta el título o el archivo");

        setCargando(true);
        try {
            const urlSimulada = URL.createObjectURL(archivoFisico);

            const response = await fetch('/api/canciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo,
                    artista: artista || 'Desconocido',
                    url_archivo: urlSimulada,
                }),
            });

            const nuevaCancion = await response.json();
            setCanciones([nuevaCancion, ...canciones]);
            setTitulo('');
            setArtista('');
            setArchivoFisico(null);
            e.target.reset();
        } catch (error) {
            console.error("Error al subir:", error);
        } finally {
            setCargando(false);
        }
    };

    // Evita que la pantalla del reproductor parpadee antes de redirigir al login
    if (!autorizado) return null;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">

            {/* Cabecera con saludo y botón de salir */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-lg">
                <p className="text-neutral-300">
                    Hola, <span className="font-bold text-green-400">{usuario?.nombre}</span> 👋
                </p>
                <button
                    onClick={cerrarSesion}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                    Cerrar Sesión
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Panel del Reproductor y Formulario */}
                <div className="space-y-8">
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
                        <h1 className="text-3xl font-bold mb-6 text-green-400">🎵 Mi Reproductor</h1>

                        <div className="bg-neutral-950 p-4 rounded-xl mb-6 flex flex-col items-center">
                            <p className="text-neutral-400 text-sm mb-2">Reproduciendo ahora:</p>
                            <h2 className="text-xl font-semibold text-white mb-4">
                                {cancionActual ? `${cancionActual.titulo} - ${cancionActual.artista}` : 'Ninguna pista seleccionada'}
                            </h2>
                            <audio
                                ref={audioRef}
                                src={cancionActual?.url_archivo}
                                controls
                                className="w-full outline-none"
                            />
                        </div>

                        <form onSubmit={subirCancion} className="space-y-4 border-t border-neutral-800 pt-6">
                            <h3 className="text-lg font-medium">Subir nueva canción</h3>
                            <input
                                type="text"
                                placeholder="Título de la canción"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="w-full bg-neutral-800 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Artista"
                                value={artista}
                                onChange={(e) => setArtista(e.target.value)}
                                className="w-full bg-neutral-800 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setArchivoFisico(e.target.files[0])}
                                className="w-full bg-neutral-800 p-2 rounded-lg text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-neutral-950 hover:file:bg-green-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-green-500 text-neutral-950 font-bold py-3 rounded-lg hover:bg-green-400 transition disabled:opacity-50"
                            >
                                {cargando ? 'Guardando...' : 'Subir a la BD'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de reproducción */}
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6">Lista de Reproducción</h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {canciones.length === 0 ? (
                            <p className="text-neutral-500 text-center mt-10">No hay canciones en la base de datos.</p>
                        ) : (
                            canciones.map((cancion) => (
                                <div
                                    key={cancion.id}
                                    onClick={() => reproducir(cancion)}
                                    className={`p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${cancionActual?.id === cancion.id
                                            ? 'bg-green-500/20 border border-green-500/50'
                                            : 'bg-neutral-800 hover:bg-neutral-700'
                                        }`}
                                >
                                    <div>
                                        <h4 className={`font-semibold ${cancionActual?.id === cancion.id ? 'text-green-400' : 'text-white'}`}>
                                            {cancion.titulo}
                                        </h4>
                                        <p className="text-sm text-neutral-400">{cancion.artista}</p>
                                    </div>
                                    {cancionActual?.id === cancion.id && (
                                        <span className="text-green-400 animate-pulse">▶</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}