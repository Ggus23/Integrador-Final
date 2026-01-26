'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <h2 className="mb-4 text-2xl font-bold">¡Algo salió mal!</h2>
            <p className="mb-6 text-muted-foreground">
                Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Intentar de nuevo
                </Button>
                <Button onClick={() => (window.location.href = '/')} variant="outline">
                    Volver al Inicio
                </Button>
            </div>
        </div>
    );
}
