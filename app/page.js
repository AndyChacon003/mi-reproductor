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
        const usuarioGuardado = localStorage.getItem('usuario');

        if (!usuarioGuardado) {
            router.push('/login');
        } else {
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

    if (!autorizado) return null;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans">

            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 md:mb-8 bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-lg">
                <p className="text-neutral-300 text-center sm:text-left">
                    Hola, <span className="font-bold text-purple-400">{usuario?.nombre}</span> 👋
                </p>
                <button
                    onClick={cerrarSesion}
                    className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                    Cerrar Sesión
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

                <div className="space-y-6 md:space-y-8">
                    <div className="bg-neutral-900 p-5 md:p-6 rounded-2xl border border-neutral-800 shadow-xl">
                        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-purple-400">🎵 Mi Reproductor</h1>

                        <div className="bg-neutral-950 p-4 rounded-xl mb-6 flex flex-col items-center">
                            <p className="text-neutral-400 text-sm mb-2">Reproduciendo ahora:</p>
                            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 text-center">
                                {cancionActual ? `${cancionActual.titulo} - ${cancionActual.artista}` : 'Ninguna pista seleccionada'}
                            </h2>
                            <audio
                                ref={audioRef}
                                src={cancionActual?.url_archivo}
                                controls
                                className="w-full outline-none h-10 md:h-12"
                            />
                        </div>

                        <form onSubmit={subirCancion} className="space-y-4 border-t border-neutral-800 pt-6">
                            <h3 className="text-lg font-medium">Subir nueva canción</h3>
                            <input
                                type="text"
                                placeholder="Título de la canción"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="w-full bg-neutral-800 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Artista"
                                value={artista}
                                onChange={(e) => setArtista(e.target.value)}
                                className="w-full bg-neutral-800 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
                            />
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setArchivoFisico(e.target.files[0])}
                                className="w-full bg-neutral-800 p-2 rounded-lg text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition"
                                required
                            />
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                {cargando ? 'Guardando...' : 'Subir a la BD'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-neutral-900 p-5 md:p-6 rounded-2xl border border-neutral-800 shadow-xl">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Lista de Reproducción</h2>
                    <div className="space-y-2 max-h-[350px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {canciones.length === 0 ? (
                            <p className="text-neutral-500 text-center mt-10 text-sm md:text-base">No hay canciones en la base de datos.</p>
                        ) : (
                            canciones.map((cancion) => (
                                <div
                                    key={cancion.id}
                                    onClick={() => reproducir(cancion)}
                                    className={`p-3 md:p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${cancionActual?.id === cancion.id
                                        ? 'bg-purple-500/20 border border-purple-500/50'
                                        : 'bg-neutral-800 hover:bg-neutral-700'
                                        }`}
                                >
                                    <div className="truncate pr-2">
                                        <h4 className={`font-semibold truncate ${cancionActual?.id === cancion.id ? 'text-purple-400' : 'text-white'}`}>
                                            {cancion.titulo}
                                        </h4>
                                        <p className="text-xs md:text-sm text-neutral-400 truncate">{cancion.artista}</p>
                                    </div>
                                    {cancionActual?.id === cancion.id && (
                                        <span className="text-purple-400 animate-pulse flex-shrink-0">▶</span>
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