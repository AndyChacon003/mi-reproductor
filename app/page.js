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
            // 1. Subir el archivo de audio a Vercel Blob
            const responseBlob = await fetch(`/api/upload?filename=${archivoFisico.name}`, {
                method: 'POST',
                body: archivoFisico,
            });

            const blobData = await responseBlob.json();
            if (!responseBlob.ok) throw new Error(blobData.error || "Error subiendo el audio");

            // Obtenemos la URL permanente de Vercel
            const urlDefinitiva = blobData.url;

            // 2. Guardar los datos en Neon con la URL real
            const responseNeon = await fetch('/api/canciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo,
                    artista: artista || 'Desconocido',
                    url_archivo: urlDefinitiva,
                }),
            });

            const nuevaCancion = await responseNeon.json();

            // Actualizamos la lista
            setCanciones([nuevaCancion, ...canciones]);
            setTitulo('');
            setArtista('');
            setArchivoFisico(null);
            e.target.reset();

        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al subir la canción.");
        } finally {
            setCargando(false);
        }
    };

    if (!autorizado) return null;

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-neutral-950 to-black text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">

            {/* Cabecera Glassmorphism */}
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg transition-all hover:bg-white/10">
                <p className="text-neutral-300 text-center sm:text-left text-lg">
                    Hola, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{usuario?.nombre}</span> ✨
                </p>
                <button
                    onClick={cerrarSesion}
                    className="w-full sm:w-auto bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-red-500/20 hover:border-transparent"
                >
                    Cerrar Sesión
                </button>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Lado Izquierdo: Reproductor */}
                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/20 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500"></div>

                        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 relative z-10">🎵 Now Playing</h1>

                        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl mb-8 flex flex-col items-center border border-white/5 relative z-10">
                            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                                <span className="text-2xl">🎧</span>
                            </div>
                            <p className="text-purple-300 text-xs uppercase tracking-widest mb-2 font-semibold">Sonando ahora</p>
                            <h2 className="text-xl font-bold text-white mb-6 text-center line-clamp-2">
                                {cancionActual ? `${cancionActual.titulo} - ${cancionActual.artista}` : 'Selecciona un track'}
                            </h2>
                            <audio
                                ref={audioRef}
                                src={cancionActual?.url_archivo}
                                controls
                                className="w-full outline-none h-10 md:h-12 opacity-90 hover:opacity-100 transition-opacity drop-shadow-md"
                            />
                        </div>

                        <form onSubmit={subirCancion} className="space-y-5 relative z-10">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 font-medium pl-1">Título</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Blinding Lights"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    className="w-full bg-black/40 p-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 border border-white/10 transition-all placeholder:text-neutral-600"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 font-medium pl-1">Artista</label>
                                <input
                                    type="text"
                                    placeholder="Ej. The Weeknd"
                                    value={artista}
                                    onChange={(e) => setArtista(e.target.value)}
                                    className="w-full bg-black/40 p-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 border border-white/10 transition-all placeholder:text-neutral-600"
                                />
                            </div>
                            <div className="pt-2">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setArchivoFisico(e.target.files[0])}
                                    className="w-full bg-black/20 p-2 rounded-xl text-neutral-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wide file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer transition-all border border-dashed border-white/20 hover:border-purple-500/50"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 mt-4 active:scale-[0.98]"
                            >
                                {cargando ? 'Subiendo track...' : 'Subir a la biblioteca'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lado Derecho: Lista de reproducción */}
                <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[600px] md:h-auto md:min-h-[700px]">
                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-2xl md:text-3xl font-bold">Tu Biblioteca</h2>
                        <span className="text-sm font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">{canciones.length} tracks</span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-3 custom-scrollbar flex-1">
                        {canciones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
                                <span className="text-6xl">📭</span>
                                <p className="text-center text-sm md:text-base">Tu biblioteca está vacía.<br />Sube tu primer track para comenzar.</p>
                            </div>
                        ) : (
                            canciones.map((cancion) => (
                                <div
                                    key={cancion.id}
                                    onClick={() => reproducir(cancion)}
                                    className={`p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center group border ${cancionActual?.id === cancion.id
                                            ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                            : 'bg-black/20 border-transparent hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${cancionActual?.id === cancion.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10'}`}>
                                            {cancionActual?.id === cancion.id ? (
                                                <div className="flex gap-1 items-end h-4">
                                                    <div className="w-1 bg-white animate-[bounce_1s_infinite] rounded-t-sm"></div>
                                                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] rounded-t-sm"></div>
                                                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] rounded-t-sm"></div>
                                                </div>
                                            ) : (
                                                <span>▶</span>
                                            )}
                                        </div>

                                        <div className="truncate pr-4">
                                            <h4 className={`font-bold truncate text-base md:text-lg transition-colors ${cancionActual?.id === cancion.id ? 'text-purple-300' : 'text-white group-hover:text-purple-100'}`}>
                                                {cancion.titulo}
                                            </h4>
                                            <p className="text-sm text-neutral-400 truncate mt-0.5">{cancion.artista}</p>
                                        </div>
                                    </div>

                                    <span className="text-xs text-neutral-600 shrink-0 hidden sm:block font-medium">
                                        {new Date(cancion.creado_en).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}