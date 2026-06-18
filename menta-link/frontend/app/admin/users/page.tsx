/* eslint-disable prettier/prettier */
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
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
      const unique = data.filter(
        (u: User, i: number, self: User[]) => self.findIndex((x) => x.id === u.id) === i
      );
      setUsers(unique);
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



        {/* Native Analytics Dashboard Dialog */}
        <Dialog open={!!selectedGrafanaUser} onOpenChange={(open) => !open && setSelectedGrafanaUser(null)}>
          <DialogContent className="dark w-[95vw] sm:w-[90vw] md:w-full max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6 bg-slate-950 border-slate-800 text-white rounded-xl shadow-2xl overflow-y-auto">
            <DialogHeader className="border-b border-slate-800 pb-4 mb-2 shrink-0">
              <DialogTitle className="text-xl font-serif font-bold text-white flex items-center gap-2">
                📊 Analítica del Estudiante
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-1">
                <span className="text-white font-bold">{selectedGrafanaUser?.full_name}</span>
                <span className="ml-2 text-slate-600">·</span>
                <span className="ml-2">{selectedGrafanaUser?.email}</span>
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
              <div className="space-y-5 pr-1 text-slate-100">

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {/* Riesgo General */}
                  {(() => {
                    const lvl = analyticsData.details.risk_summary?.current_risk_level || analyticsData.details.risk_level;
                    const isHigh = lvl === 'high' || lvl === 'alto';
                    const isMed  = lvl === 'medium' || lvl === 'medio';
                    return (
                      <div className={`rounded-xl border p-4 space-y-2 ${
                        isHigh ? 'bg-rose-500/10 border-rose-500/30'
                        : isMed ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado de Riesgo</p>
                        <p className={`text-2xl font-black ${
                          isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isHigh ? '🚨 ALTO' : isMed ? '⚠️ MEDIO' : '✅ BAJO'}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {isHigh ? 'Requiere intervención prioritaria.' : isMed ? 'Seguimiento recomendado.' : 'Bienestar estable.'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Probabilidad de Abandono */}
                  {(() => {
                    const prob = analyticsData.details.risk_summary?.dropout_probability;
                    const pct  = prob !== undefined ? prob * 100 : null;
                    const isHigh = pct !== null && pct >= 60;
                    const isMed  = pct !== null && pct >= 30;
                    return (
                      <div className={`rounded-xl border p-4 space-y-2 ${
                        isHigh ? 'bg-rose-500/10 border-rose-500/30'
                        : isMed ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prob. Abandono (IA)</p>
                        <p className={`text-2xl font-black ${
                          isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {pct !== null ? `${pct.toFixed(0)}%` : '—'}
                        </p>
                        {pct !== null && (
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${
                              isHigh ? 'bg-rose-400' : isMed ? 'bg-amber-400' : 'bg-emerald-400'
                            }`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 leading-snug">Basado en GPA, reprobación e inactividad.</p>
                      </div>
                    );
                  })()}

                  {/* Confianza Modelo */}
                  {(() => {
                    const conf = analyticsData.details.risk_summary?.prediction_confidence;
                    const pct  = conf !== undefined ? conf * 100 : null;
                    return (
                      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confianza del Modelo</p>
                        <p className="text-2xl font-black text-purple-400">{pct !== null ? `${pct.toFixed(0)}%` : '—'}</p>
                        {pct !== null && (
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 leading-snug">Precisión según historial registrado.</p>
                      </div>
                    );
                  })()}
                </div>

                {/* ── Factores de Riesgo ── */}
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">⚖️ Factores de Riesgo (IA)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Variables con mayor peso en el diagnóstico. Barra más larga = mayor impacto.</p>
                    </div>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-2 py-1 rounded border border-teal-500/20 self-start shrink-0">
                      💡 Mayor barra = Mayor impacto
                    </span>
                  </div>
                  <RiskFactorsChart factors={analyticsData.details.risk_factors || {}} />
                </div>

                {/* ── Tendencias Emocionales ── */}
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-5">
                  <div className="border-b border-slate-700/50 pb-3 mb-5">
                    <h4 className="text-sm font-bold text-white">🧠 Bienestar Emocional</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Índice de equilibrio, distribución de emociones y evolución semanal.</p>
                  </div>
                  <EmotionalTrendsPanel data={analyticsData.trends} />
                </div>

                {/* ── Rendimiento Académico ── */}
                {analyticsData.details.academic_profile && (
                  <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white">🎓 Rendimiento Académico</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase text-slate-500">Carrera</p>
                        <p className="text-sm font-bold mt-1">{analyticsData.details.academic_profile.course || 'No especificada'}</p>
                      </div>
                      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase text-slate-500">Materias Aprobadas</p>
                        <p className="text-sm font-bold mt-1">{analyticsData.details.academic_profile.units_approved} unidades</p>
                      </div>
                      <div className="bg-purple-950/30 border border-purple-700/30 rounded-xl p-3">
                        <p className="text-[10px] font-black uppercase text-purple-400/70">GPA Total</p>
                        <p className="text-xl font-black text-purple-300 mt-1">
                          {analyticsData.details.academic_profile.current_gpa}
                          <span className="text-sm font-normal text-purple-400/50"> / 100</span>
                        </p>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                          <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${Math.min(analyticsData.details.academic_profile.current_gpa, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map((num) => {
                        const proc  = analyticsData.details.academic_profile[`hito${num}_procesual`] || 0;
                        const nota  = analyticsData.details.academic_profile[`hito${num}_nota`] || 0;
                        const total = proc + nota;
                        const color = total >= 51 ? 'text-emerald-400' : total >= 31 ? 'text-amber-400' : 'text-rose-400';
                        const bar   = total >= 51 ? 'bg-emerald-400' : total >= 31 ? 'bg-amber-400' : 'bg-rose-400';
                        return (
                          <div key={num} className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Hito {num}</p>
                            <p className={`text-xl font-black ${color}`}>{total}</p>
                            <p className="text-[10px] text-slate-600">/ 100 pts</p>
                            <div className="w-full bg-slate-700/50 rounded-full h-1 mt-2">
                              <div className={`h-1 rounded-full ${bar}`} style={{ width: `${Math.min(total, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 italic">
                No hay datos analíticos para mostrar.
              </div>
            )}

            <DialogFooter className="border-t border-slate-800 pt-4 mt-4 shrink-0">
              <Button
                variant="outline"
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setSelectedGrafanaUser(null)}
              >
                Cerrar panel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
