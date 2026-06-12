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
import { RiskFactorsChart } from '@/components/RiskFactorsChart';
import { EmotionalTrendsPanel } from '@/components/EmotionalTrendsPanel';
import { Skeleton } from '@/components/ui/skeleton';
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

  const [selectedGrafanaUser, setSelectedGrafanaUser] = useState<User | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    details: any;
    trends: any;
    loading: boolean;
    error: string;
  }>({
    details: null,
    trends: null,
    loading: false,
    error: '',
  });

  const handleOpenAnalytics = async (user: User) => {
    setSelectedGrafanaUser(user);
    setAnalyticsData({
      details: null,
      trends: null,
      loading: true,
      error: '',
    });
    try {
      const details = await apiClient.getStudentDetails(user.id);
      const trends = await apiClient.getStudentTrends(user.id);
      setAnalyticsData({
        details,
        trends,
        loading: false,
        error: '',
      });
    } catch (err) {
      setAnalyticsData({
        details: null,
        trends: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar los gráficos de analítica',
      });
    }
  };

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
                  <label className="text-sm font-medium">
                    Email (Institucional para estudiantes)
                  </label>
                  <Input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                    placeholder={
                      newUserData.role === 'student'
                        ? 'usuario@unifranz.edu.bo'
                        : 'usuario@gmail.com'
                    }
                  />
                  {newUserData.role === 'student' && (
                    <p className="text-primary text-[10px] font-bold">
                      * Requerido: @unifranz.edu.bo para estudiantes
                    </p>
                  )}
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
                            {u.role === 'student' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[10px] font-black font-bold uppercase transition-all border-purple-200 hover:bg-purple-50 hover:text-purple-650"
                                onClick={() => handleOpenAnalytics(u)}
                              >
                                Ver Gráficos
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
                className="bg-destructive hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                            {u.role === 'student' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[10px] font-black font-bold uppercase transition-all border-purple-200 hover:bg-purple-50 hover:text-purple-650"
                                onClick={() => handleOpenAnalytics(u)}
                              >
                                Ver Gráficos
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

        {/* Native Analytics Dashboard Dialog */}
        <Dialog open={!!selectedGrafanaUser} onOpenChange={(open) => !open && setSelectedGrafanaUser(null)}>
          <DialogContent className="dark max-w-5xl max-h-[90vh] flex flex-col p-6 bg-slate-900 border-slate-800 text-white rounded-xl shadow-2xl overflow-y-auto">
            <DialogHeader className="border-b border-slate-800 pb-4 mb-4">
              <DialogTitle className="text-2xl font-serif font-bold text-purple-400 flex items-center gap-2">
                <span>📊</span> Panel de Analítica Inteligente
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1">
                Visualización detallada de riesgo académico, emocional y rendimiento para: <span className="text-purple-350 font-bold">{selectedGrafanaUser?.full_name}</span> ({selectedGrafanaUser?.email})
              </DialogDescription>
            </DialogHeader>

            {analyticsData.loading ? (
              <div className="space-y-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-28 bg-slate-800 rounded-xl animate-pulse" />
                  <Skeleton className="h-28 bg-slate-800 rounded-xl animate-pulse" />
                  <Skeleton className="h-28 bg-slate-800 rounded-xl animate-pulse" />
                </div>
                <Skeleton className="h-[300px] bg-slate-800 rounded-xl w-full animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="h-[250px] bg-slate-800 rounded-xl animate-pulse" />
                  <Skeleton className="h-[250px] bg-slate-800 rounded-xl md:col-span-2 animate-pulse" />
                </div>
              </div>
            ) : analyticsData.error ? (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-6 my-8 text-center">
                <p className="font-bold mb-2">Error al cargar datos</p>
                <p className="text-sm">{analyticsData.error}</p>
              </div>
            ) : analyticsData.details && analyticsData.trends ? (
              <div className="space-y-8 pr-1 text-slate-100">
                {/* Executive Risk Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl shadow-sm hover:border-slate-600/50 transition-all">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
                      Estado de Riesgo General
                    </span>
                    <div className="text-2xl font-black text-white mt-1">
                      {analyticsData.details.risk_level === 'high' ? '🚨 ALTO' : analyticsData.details.risk_level === 'medium' ? '⚠️ MEDIO' : '✅ BAJO'}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {analyticsData.details.risk_level === 'high'
                        ? 'Requiere intervención prioritaria debido a múltiples alertas.'
                        : analyticsData.details.risk_level === 'medium'
                          ? 'Se recomienda seguimiento oportuno de los factores influyentes.'
                          : 'El estudiante mantiene niveles estables de bienestar.'}
                    </p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl shadow-sm hover:border-slate-600/50 transition-all">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
                      Probabilidad de Abandono (IA)
                    </span>
                    <div className="text-2xl font-black text-white mt-1">
                      {analyticsData.details.risk_summary?.dropout_probability !== undefined ? (
                        <>
                          {(analyticsData.details.risk_summary.dropout_probability * 100).toFixed(0)}%
                          <span className="text-xs font-medium text-slate-405 ml-2">
                            ({analyticsData.details.risk_summary.dropout_risk === 'high' ? 'Alto' : analyticsData.details.risk_summary.dropout_risk === 'medium' ? 'Medio' : 'Bajo'})
                          </span>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Riesgo estimado de abandono escolar basado en GPA, reprobación e inactividad.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl shadow-sm hover:border-slate-600/50 transition-all">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
                      Confianza de Predicción (IA)
                    </span>
                    <div className="text-2xl font-black text-white mt-1">
                      {analyticsData.details.risk_summary?.prediction_confidence !== undefined ? (
                        `${(analyticsData.details.risk_summary.prediction_confidence * 100).toFixed(0)}%`
                      ) : (
                        'N/A'
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Precisión del modelo según la cantidad de datos e historial del alumno.
                    </p>
                  </div>
                </div>

                {/* Factors Chart */}
                <div className="bg-slate-800/30 border border-slate-850 p-6 rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">Análisis de Factores de Riesgo (IA)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Peso e impacto de cada variable en el diagnóstico del modelo.
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-teal-400 font-bold px-2 py-1 rounded border border-teal-500/20">
                      💡 Barra más larga = Mayor Impacto
                    </span>
                  </div>
                  <RiskFactorsChart factors={analyticsData.details.risk_factors || {}} />
                </div>

                {/* Emotional Trends */}
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2 mb-4">
                    <h4 className="text-lg font-bold text-white">🧠 Tendencias Emocionales y Bienestar</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Medición del equilibrio estudiantil, estado de ánimo semanal y evolución.
                    </p>
                  </div>
                  <EmotionalTrendsPanel data={analyticsData.trends} />
                </div>

                {/* Academic Profile */}
                {analyticsData.details.academic_profile && (
                  <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-bold text-white mb-4">🎓 Rendimiento Académico Detallado</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <span className="text-slate-400 text-[10px] font-black uppercase">Carrera</span>
                        <span className="text-lg font-bold block mt-1">
                          {analyticsData.details.academic_profile.course || 'No especificada'}
                        </span>
                      </div>
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <span className="text-slate-400 text-[10px] font-black uppercase">Materias Aprobadas</span>
                        <span className="text-lg font-bold block mt-1">
                          {analyticsData.details.academic_profile.units_approved} Unidades
                        </span>
                      </div>
                      <div className="bg-purple-950/20 border border-purple-800/30 rounded-xl p-4">
                        <span className="text-purple-400 text-[10px] font-black uppercase">Promedio Total (GPA)</span>
                        <span className="text-purple-400 text-xl font-black block mt-1">
                          {analyticsData.details.academic_profile.current_gpa}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="border border-slate-800 overflow-hidden rounded-xl">
                      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-800 text-center bg-slate-900/55">
                        {[2, 3, 4, 5].map((num) => {
                          const proc = analyticsData.details.academic_profile[`hito${num}_procesual`] || 0;
                          const nota = analyticsData.details.academic_profile[`hito${num}_nota`] || 0;
                          return (
                            <div key={num} className="p-4">
                              <div className="text-slate-400 text-[10px] font-black uppercase">Hito {num}</div>
                              <div className="text-purple-400 text-2xl font-black mt-1">{proc + nota}</div>
                              <div className="text-slate-500 text-[10px]">Nota Final</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 italic">
                No hay datos analíticos para mostrar.
              </div>
            )}

            <DialogFooter className="border-t border-slate-800 pt-4 mt-6">
              <Button
                variant="outline"
                className="border-slate-700 bg-transparent text-white hover:bg-slate-800"
                onClick={() => setSelectedGrafanaUser(null)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
