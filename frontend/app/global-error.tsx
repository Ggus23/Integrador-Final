'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="es">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Error Crítico</h2>
                    <p className="mb-6 text-gray-600">
                        Ocurrió un error que impide cargar la aplicación.
                    </p>
                    <Button onClick={() => reset()} variant="destructive">
                        Recargar Aplicación
                    </Button>
                </div>
            </body>
        </html>
    );
}
