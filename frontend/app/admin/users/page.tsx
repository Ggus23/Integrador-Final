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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
  });

  // Dialog states
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{
    id: string;
    name: string;
    status: boolean;
  } | null>(null);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await apiClient.createUserByAdmin(newUserData);
      toast.success('Usuario creado exitosamente');
      setIsCreateOpen(false);
      setNewUserData({ full_name: '', email: '', password: '', role: 'student' }); // Reset form
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setCreateLoading(false);
    }
  };

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
        <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 py-24">
          <div className="border-primary/30 border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground font-medium">Verificando credenciales...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-8 px-4 pb-12">
        <div className="animate-fade-in">
          <h1 className="text-foreground font-serif text-4xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Administra los roles, estados y permanencia de los usuarios en el sistema.
          </p>
        </div>

        <div className="flex justify-end">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 font-bold text-white">
                + Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario (Interno)</DialogTitle>
                <DialogDescription>
                  Este formulario permite crear cuentas de Estudiantes, Psicólogos o Administradores
                  directamente. Estas cuentas se validan automáticamente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <Input
                    value={newUserData.full_name}
                    onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                    required
                    placeholder="Ej. Dra. Ana López"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (@gmail.com)</label>
                  <Input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                    placeholder="usuario@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select
                    value={newUserData.role}
                    onValueChange={(val) => setNewUserData({ ...newUserData, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="psychologist">Psicólogo</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña Inicial</label>
                  <Input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    required
                    minLength={8}
                    placeholder="••••••••"
                  />
                  <p className="text-muted-foreground text-[10px]">
                    Mínimo 8 caracteres, al menos un número.
                  </p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Card className="bg-destructive/10 border-destructive text-destructive animate-shake p-4 text-sm">
            {error}
          </Card>
        )}

        <Card className="border-border animate-slide-up overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                <tr>
                  <th className="px-6 py-5">Identidad del Usuario</th>
                  <th className="px-6 py-5">Rol en el Sistema</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Acciones Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-border/50 divide-y">
                {dataLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-muted-foreground px-6 py-12 text-center italic">
                      Cargando base de datos de usuarios...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-muted/5 group transition-colors ${!u.is_active ? 'bg-muted/10 opacity-60' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <div className="text-foreground group-hover:text-primary font-bold transition-colors">
                          {u.full_name}
                        </div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className={
                            u.role === 'admin'
                              ? 'border-purple-700 bg-purple-600 px-3 py-1 font-bold text-white'
                              : u.role === 'psychologist'
                                ? 'border-blue-700 bg-blue-600 px-3 py-1 font-bold text-white'
                                : 'border-slate-700 bg-slate-600 px-3 py-1 font-bold text-white'
                          }
                        >
                          {u.role === 'admin'
                            ? 'ADMINISTRADOR'
                            : u.role === 'psychologist'
                              ? 'PSICÓLOGO'
                              : 'ESTUDIANTE'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className={
                            u.is_active
                              ? 'border-green-200 bg-green-500/10 text-green-700'
                              : 'border-red-200 bg-red-500/10 text-red-700'
                          }
                        >
                          {u.is_active ? 'ACTIVO' : 'DESACTIVADO'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        {u.id !== currentUser?.id && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 px-4 text-[10px] font-black uppercase transition-all ${
                                u.is_active
                                  ? 'border-amber-200 hover:bg-amber-50 hover:text-amber-600'
                                  : 'border-green-200 hover:bg-green-50 hover:text-green-600'
                              }`}
                              onClick={() =>
                                setConfirmToggle({
                                  id: u.id,
                                  name: u.full_name,
                                  status: u.is_active,
                                })
                              }
                            >
                              {u.is_active ? 'Desactivar' : 'Activar'}
                            </Button>

                            {u.role !== 'psychologist' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[10px] font-black font-bold uppercase transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => handleRoleChange(u.id, 'psychologist')}
                              >
                                Hacer Psicólogo
                              </Button>
                            )}
                            {u.role !== 'student' && u.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[10px] font-black font-bold uppercase transition-all hover:bg-slate-50 hover:text-slate-600"
                                onClick={() => handleRoleChange(u.id, 'student')}
                              >
                                Hacer Estudiante
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="shadow-destructive/10 h-8 px-4 text-[10px] font-black uppercase shadow-lg"
                              onClick={() => setConfirmDelete({ id: u.id, name: u.full_name })}
                            >
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Confirmation Dialog for Toggle Status */}
        <AlertDialog
          open={!!confirmToggle}
          onOpenChange={(open) => !open && setConfirmToggle(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Estás a punto de{' '}
                    <strong>{confirmToggle?.status ? 'desactivar' : 'activar'}</strong> la cuenta de{' '}
                    <strong>{confirmToggle?.name}</strong>.
                  </p>
                  {confirmToggle?.status && (
                    <div className="text-destructive bg-destructive/5 border-destructive/10 mt-2 rounded border p-2 text-xs font-bold">
                      Nota: Al desactivar, se resolverán automáticamente todas sus alertas
                      pendientes.
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeToggleStatus}
                className={
                  confirmToggle?.status
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-green-600 hover:bg-green-700'
                }
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation Dialog for Permanent Delete */}
        <AlertDialog
          open={!!confirmDelete}
          onOpenChange={(open) => !open && setConfirmDelete(null)}
        >
          <AlertDialogContent className="border-destructive/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive font-serif text-2xl">
                ¿ELIMINAR PERMANENTEMENTE?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <p>
                    Estás a punto de eliminar a <strong>{confirmDelete?.name}</strong> de forma
                    irreversible.
                  </p>
                  <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4 text-xs leading-relaxed">
                    <strong className="mb-1 block">ADVERTENCIA:</strong>
                    Esta acción borrará al usuario y TODA su información histórica (alertas,
                    evaluaciones psicométricas, registros de bienestar) de la base de datos. No se
                    puede deshacer.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDeleteUser}
                className="bg-destructive hover:bg-destructive/90 font-bold text-white"
              >
                ELIMINAR TODO
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
