'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
}

export default function AdminUsersPage() {
    const { user: currentUser, loading } = useProtected();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    // Dialog states
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);
    const [confirmToggle, setConfirmToggle] = useState<{ id: string, name: string, status: boolean } | null>(null);

    const fetchUsers = async () => {
        try {
            setDataLoading(true);
            const data = await apiClient.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
            toast.error('No se pudieron cargar los usuarios');
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            if (!currentUser || currentUser.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchUsers();
            }
        }
    }, [currentUser, loading, router]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const roleName = newRole === 'psychologist' ? 'Psicólogo' : 'Estudiante';
        try {
            await apiClient.updateUserRole(userId, newRole);
            toast.success(`Rol actualizado a ${roleName}`);
            fetchUsers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cambiar rol');
        }
    };

    const executeToggleStatus = async () => {
        if (!confirmToggle) return;
        const { id, status } = confirmToggle;
        try {
            await apiClient.toggleUserStatus(id);
            toast.success(`Cuenta ${status ? 'desactivada' : 'activada'} correctamente`);
            setConfirmToggle(null);
            fetchUsers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cambiar estado');
        }
    };

    const executeDeleteUser = async () => {
        if (!confirmDelete) return;
        try {
            await apiClient.deleteUser(confirmDelete.id);
            toast.success('Usuario y datos eliminados permanentemente');
            setConfirmDelete(null);
            fetchUsers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al eliminar');
        }
    };

    if (loading || (currentUser && currentUser.role !== 'admin')) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Verificando credenciales...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4">
                <div className="animate-fade-in">
                    <h1 className="text-4xl font-serif font-bold text-foreground">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground text-lg mt-2">
                        Administra los roles, estados y permanencia de los usuarios en el sistema.
                    </p>
                </div>

                {error && (
                    <Card className="p-4 bg-destructive/10 border-destructive text-destructive text-sm animate-shake">
                        {error}
                    </Card>
                )}

                <Card className="border-border shadow-xl overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-5">Identidad del Usuario</th>
                                    <th className="px-6 py-5">Rol en el Sistema</th>
                                    <th className="px-6 py-5">Estado</th>
                                    <th className="px-6 py-5">Acciones Administrativas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {dataLoading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                            Cargando base de datos de usuarios...
                                        </td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className={`hover:bg-muted/5 transition-colors group ${!u.is_active ? 'opacity-60 bg-muted/10' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{u.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="outline" className={
                                                u.role === 'admin' ? 'bg-purple-600 text-white border-purple-700 font-bold px-3 py-1' :
                                                    u.role === 'psychologist' ? 'bg-blue-600 text-white border-blue-700 font-bold px-3 py-1' :
                                                        'bg-slate-600 text-white border-slate-700 font-bold px-3 py-1'
                                            }>
                                                {u.role === 'admin' ? 'ADMINISTRADOR' : u.role === 'psychologist' ? 'PSICÓLOGO' : 'ESTUDIANTE'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="outline" className={
                                                u.is_active ? 'bg-green-500/10 text-green-700 border-green-200' : 'bg-red-500/10 text-red-700 border-red-200'
                                            }>
                                                {u.is_active ? 'ACTIVO' : 'DESACTIVADO'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            {u.id !== currentUser?.id && (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={`text-[10px] font-black uppercase h-8 px-4 transition-all ${u.is_active ? 'hover:bg-amber-50 hover:text-amber-600 border-amber-200' : 'hover:bg-green-50 hover:text-green-600 border-green-200'
                                                            }`}
                                                        onClick={() => setConfirmToggle({ id: u.id, name: u.full_name, status: u.is_active })}
                                                    >
                                                        {u.is_active ? 'Desactivar' : 'Activar'}
                                                    </Button>

                                                    {u.role !== 'psychologist' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-[10px] font-black uppercase h-8 px-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-bold"
                                                            onClick={() => handleRoleChange(u.id, 'psychologist')}
                                                        >
                                                            Hacer Psicólogo
                                                        </Button>
                                                    )}
                                                    {u.role !== 'student' && u.role !== 'admin' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-[10px] font-black uppercase h-8 px-4 hover:bg-slate-50 hover:text-slate-600 transition-all font-bold"
                                                            onClick={() => handleRoleChange(u.id, 'student')}
                                                        >
                                                            Hacer Estudiante
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="text-[10px] font-black uppercase h-8 px-4 shadow-lg shadow-destructive/10"
                                                        onClick={() => setConfirmDelete({ id: u.id, name: u.full_name })}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Confirmation Dialog for Toggle Status */}
                <AlertDialog open={!!confirmToggle} onOpenChange={(open) => !open && setConfirmToggle(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-3">
                                    <p>Estás a punto de <strong>{confirmToggle?.status ? 'desactivar' : 'activar'}</strong> la cuenta de <strong>{confirmToggle?.name}</strong>.</p>
                                    {confirmToggle?.status && (
                                        <div className="mt-2 text-destructive font-bold bg-destructive/5 p-2 rounded border border-destructive/10 text-xs">
                                            Nota: Al desactivar, se resolverán automáticamente todas sus alertas pendientes.
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={executeToggleStatus} className={confirmToggle?.status ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}>
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Confirmation Dialog for Permanent Delete */}
                <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                    <AlertDialogContent className="border-destructive/20">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive font-serif text-2xl">¿ELIMINAR PERMANENTEMENTE?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 pt-2">
                                    <p>Estás a punto de eliminar a <strong>{confirmDelete?.name}</strong> de forma irreversible.</p>
                                    <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 text-destructive text-xs leading-relaxed">
                                        <strong className="block mb-1">ADVERTENCIA:</strong>
                                        Esta acción borrará al usuario y TODA su información histórica (alertas, evaluaciones psicométricas, registros de bienestar) de la base de datos. No se puede deshacer.
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={executeDeleteUser} className="bg-destructive hover:bg-destructive/90 text-white font-bold">
                                ELIMINAR TODO
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}
