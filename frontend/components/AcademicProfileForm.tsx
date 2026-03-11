'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { AcademicProfile } from '@/lib/types';

export function AcademicProfileForm() {
  const [profile, setProfile] = useState<Partial<AcademicProfile>>({
    course: '',
    scholarship_holder: false,
    tuition_fees_up_to_date: true,
    current_semester: 1,
    units_approved: 0,
    current_gpa: 0,
    hito2_procesual: 0,
    hito2_nota: 0,
    hito3_procesual: 0,
    hito3_nota: 0,
    hito4_procesual: 0,
    hito4_nota: 0,
    hito5_procesual: 0,
    hito5_nota: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.getMyAcademicProfile();
        if (data) setProfile(data);
      } catch (err) {
        console.error('Error fetching academic profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Calcula el total automáticamente cuando cambian los hitos
  useEffect(() => {
    const total =
      (profile.hito2_procesual || 0) +
      (profile.hito2_nota || 0) +
      (profile.hito3_procesual || 0) +
      (profile.hito3_nota || 0) +
      (profile.hito4_procesual || 0) +
      (profile.hito4_nota || 0) +
      (profile.hito5_procesual || 0) +
      (profile.hito5_nota || 0);

    if (total !== profile.current_gpa) {
      setProfile((prev) => ({ ...prev, current_gpa: total }));
    }
  }, [
    profile.hito2_procesual,
    profile.hito2_nota,
    profile.hito3_procesual,
    profile.hito3_nota,
    profile.hito4_procesual,
    profile.hito4_nota,
    profile.hito5_procesual,
    profile.hito5_nota,
    profile.current_gpa,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.updateMyAcademicProfile(profile);
      toast.success('Perfil académico actualizado (Hitos guardados)');
    } catch (err) {
      toast.error('Error al actualizar perfil académico');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando perfil académico...</div>;

  const HitoInput = ({ num, label }: { num: number; label: string }) => {
    const procKey = `hito${num}_procesual` as keyof AcademicProfile;
    const notaKey = `hito${num}_nota` as keyof AcademicProfile;

    return (
      <div className="bg-card border-border/60 hover:border-primary/30 group space-y-4 rounded-2xl border p-5 shadow-sm transition-all">
        <div className="flex items-center justify-between">
          <h4 className="text-muted-foreground group-hover:text-primary text-xs font-black tracking-tighter uppercase transition-colors">
            {label}
          </h4>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
            Total: {((profile[procKey] as number) || 0) + ((profile[notaKey] as number) || 0)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="flex justify-between text-[10px] font-bold uppercase opacity-60">
              <span>Procesual</span>
              <span className="text-primary/80">Max 15</span>
            </Label>
            <Input
              type="number"
              max={15}
              min={0}
              className="bg-muted/30 focus:ring-primary/30 h-9 border-none text-sm focus:ring-1"
              value={(profile[procKey] as number) || 0}
              onChange={(e) => setProfile({ ...profile, [procKey]: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex justify-between text-[10px] font-bold uppercase opacity-60">
              <span>Examen Hito</span>
              <span className="text-primary/80">Max 10</span>
            </Label>
            <Input
              type="number"
              max={10}
              min={0}
              className="bg-muted/30 focus:ring-primary/30 h-9 border-none text-sm focus:ring-1"
              value={(profile[notaKey] as number) || 0}
              onChange={(e) => setProfile({ ...profile, [notaKey]: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-border relative overflow-hidden p-4 shadow-xl md:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="space-y-1">
          <h3 className="text-foreground font-serif text-2xl font-bold md:text-3xl">
            Registro de Hitos Académicos
          </h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Ingresa tus calificaciones por hito. El Hito 1 es diagnóstico y no suma al promedio
            final.
          </p>
        </div>
        <div className="bg-primary/10 border-primary/20 min-w-[150px] rounded-2xl border p-4 text-center md:text-right">
          <span className="text-primary/70 mb-1 block text-[10px] font-black uppercase">
            Nota Final Proyectada
          </span>
          <span
            className={`text-4xl font-black ${profile.current_gpa && profile.current_gpa >= 51 ? 'text-risk-low' : 'text-risk-high'}`}
          >
            {profile.current_gpa}/100
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Info General */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <Label
              htmlFor="course"
              className="text-foreground/80 text-sm font-bold tracking-wide uppercase"
            >
              Carrera Universitaria
            </Label>
            <Input
              id="course"
              className="bg-background border-border/60 focus:border-primary h-14 text-lg shadow-sm"
              value={profile.course || ''}
              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
              placeholder="Ej. Ingeniería en Sistemas"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="approved"
              className="text-foreground/80 text-sm font-bold tracking-wide uppercase"
            >
              Materias Aprobadas (Semestre Anterior)
            </Label>
            <Input
              id="approved"
              type="number"
              className="bg-background border-border/60 focus:border-primary h-14 text-lg shadow-sm"
              value={profile.units_approved || 0}
              onChange={(e) => setProfile({ ...profile, units_approved: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="border-border w-full border-t"></div>
          </div>
          <div className="relative flex justify-start">
            <span className="bg-card text-primary pr-4 text-sm font-bold tracking-widest uppercase">
              Progreso Semestral (Hitos)
            </span>
          </div>
        </div>

        {/* Hitos Grid */}
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <HitoInput num={2} label="Hito 2" />
            <HitoInput num={3} label="Hito 3" />
            <HitoInput num={4} label="Hito 4" />
            <HitoInput num={5} label="Hito 5" />
          </div>
        </div>

        {/* Finanzas y Becas */}
        <div className="bg-primary/5 border-primary/20 grid grid-cols-1 gap-6 rounded-3xl border p-8 shadow-inner md:grid-cols-2">
          <label className="group flex cursor-pointer items-center gap-5 rounded-xl p-3 transition-all hover:bg-white/60">
            <input
              type="checkbox"
              checked={profile.scholarship_holder}
              onChange={(e) => setProfile({ ...profile, scholarship_holder: e.target.checked })}
              className="border-primary text-primary focus:ring-primary h-7 w-7 cursor-pointer rounded-lg shadow-sm transition-all"
            />
            <div className="flex flex-col">
              <span className="group-hover:text-primary text-base font-bold transition-colors">
                ¿Eres becario?
              </span>
              <span className="text-muted-foreground/80 text-xs">
                Indica si cuentas con algún beneficio de beca vigente
              </span>
            </div>
          </label>
          <label className="group flex cursor-pointer items-center gap-5 rounded-xl p-3 transition-all hover:bg-white/60">
            <input
              type="checkbox"
              checked={profile.tuition_fees_up_to_date}
              onChange={(e) =>
                setProfile({ ...profile, tuition_fees_up_to_date: e.target.checked })
              }
              className="border-primary text-primary focus:ring-primary h-7 w-7 cursor-pointer rounded-lg shadow-sm transition-all"
            />
            <div className="flex flex-col">
              <span className="group-hover:text-primary text-base font-bold transition-colors">
                ¿Mensualidades al día?
              </span>
              <span className="text-muted-foreground/80 text-xs">
                Confirmación de estado de cuenta con finanzas
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 shadow-primary/30 h-16 w-full rounded-2xl text-xl font-black shadow-2xl transition-all active:scale-[0.98]"
          >
            {saving ? 'Guardando Cambios...' : 'Actualizar Mi Seguimiento Académico'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
