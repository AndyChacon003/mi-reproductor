import './globals.css';

export const metadata = {
    title: 'Mi Reproductor de Música',
    description: 'Reproductor full-stack con Next.js y Neon',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}