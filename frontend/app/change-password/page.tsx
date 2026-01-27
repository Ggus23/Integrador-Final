'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const validatePassword = () => {
        if (newPassword.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        if (!/\d/.test(newPassword)) {
            toast.error('La contraseña debe tener al menos un número');
            return false;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setLoading(true);
        try {
            await apiClient.changeRequiredPassword(newPassword);
            toast.success('Contraseña actualizada exitosamente');
            // Force reload to update user state or just push
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold font-serif">Cambio de Contraseña Requerido</h1>
                    <p className="text-muted-foreground mt-2">
                        Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            minLength={8}
                        />
                    </div>

                    <Button type="submit" className="w-full font-bold" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña y Continuar'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
