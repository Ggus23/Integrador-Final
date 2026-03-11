
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
        hito2_procesual: 0, hito2_nota: 0,
        hito3_procesual: 0, hito3_nota: 0,
        hito4_procesual: 0, hito4_nota: 0,
        hito5_procesual: 0, hito5_nota: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiClient.getMyAcademicProfile();
                if (data) setProfile(data);
            } catch (err) {
                console.error("Error fetching academic profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Calcula el total automáticamente cuando cambian los hitos
    useEffect(() => {
        const total = 
            (profile.hito2_procesual || 0) + (profile.hito2_nota || 0) +
            (profile.hito3_procesual || 0) + (profile.hito3_nota || 0) +
            (profile.hito4_procesual || 0) + (profile.hito4_nota || 0) +
            (profile.hito5_procesual || 0) + (profile.hito5_nota || 0);
        
        if (total !== profile.current_gpa) {
            setProfile(prev => ({ ...prev, current_gpa: total }));
        }
    }, [
        profile.hito2_procesual, profile.hito2_nota,
        profile.hito3_procesual, profile.hito3_nota,
        profile.hito4_procesual, profile.hito4_nota,
        profile.hito5_procesual, profile.hito5_nota
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.updateMyAcademicProfile(profile);
            toast.success("Perfil académico actualizado (Hitos guardados)");
        } catch (err) {
            toast.error("Error al actualizar perfil académico");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Cargando perfil académico...</div>;

    const HitoInput = ({ num, label }: { num: number, label: string }) => {
        const procKey = `hito${num}_procesual` as keyof AcademicProfile;
        const notaKey = `hito${num}_nota` as keyof AcademicProfile;
        
        return (
            <div className="bg-card p-5 rounded-2xl border border-border/60 shadow-sm space-y-4 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-center">
                    <h4 className="font-black text-xs uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">{label}</h4>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Total: {((profile[procKey] as number) || 0) + ((profile[notaKey] as number) || 0)}
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-60 flex justify-between">
                            <span>Procesual</span>
                            <span className="text-primary/80">Max 15</span>
                        </Label>
                        <Input 
                            type="number" max={15} min={0}
                            className="bg-muted/30 border-none h-9 text-sm focus:ring-1 focus:ring-primary/30"
                            value={profile[procKey] as number || 0} 
                            onChange={(e) => setProfile({...profile, [procKey]: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-60 flex justify-between">
                            <span>Examen Hito</span>
                            <span className="text-primary/80">Max 10</span>
                        </Label>
                        <Input 
                            type="number" max={10} min={0}
                            className="bg-muted/30 border-none h-9 text-sm focus:ring-1 focus:ring-primary/30"
                            value={profile[notaKey] as number || 0} 
                            onChange={(e) => setProfile({...profile, [notaKey]: parseFloat(e.target.value)})}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="p-4 md:p-8 shadow-xl border-border overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div className="space-y-1">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground">Registro de Hitos Académicos</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Ingresa tus calificaciones por hito. El Hito 1 es diagnóstico y no suma al promedio final.
                    </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 min-w-[150px] text-center md:text-right">
                    <span className="text-[10px] font-black uppercase text-primary/70 block mb-1">Nota Final Proyectada</span>
                    <span className={`text-4xl font-black ${profile.current_gpa && profile.current_gpa >= 51 ? 'text-risk-low' : 'text-risk-high'}`}>
                        {profile.current_gpa}/100
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Info General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label htmlFor="course" className="text-sm font-bold text-foreground/80 uppercase tracking-wide">Carrera Universitaria</Label>
                        <Input 
                            id="course" 
                            className="h-14 bg-background border-border/60 focus:border-primary shadow-sm text-lg"
                            value={profile.course || ''} 
                            onChange={(e) => setProfile({...profile, course: e.target.value})}
                            placeholder="Ej. Ingeniería en Sistemas"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="approved" className="text-sm font-bold text-foreground/80 uppercase tracking-wide">Materias Aprobadas (Semestre Anterior)</Label>
                        <Input 
                            id="approved" 
                            type="number"
                            className="h-14 bg-background border-border/60 focus:border-primary shadow-sm text-lg"
                            value={profile.units_approved || 0} 
                            onChange={(e) => setProfile({...profile, units_approved: parseInt(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-start">
                        <span className="bg-card pr-4 text-sm font-bold uppercase tracking-widest text-primary">Progreso Semestral (Hitos)</span>
                    </div>
                </div>

                {/* Hitos Grid */}
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <HitoInput num={2} label="Hito 2" />
                        <HitoInput num={3} label="Hito 3" />
                        <HitoInput num={4} label="Hito 4" />
                        <HitoInput num={5} label="Hito 5" />
                    </div>
                </div>

                {/* Finanzas y Becas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-8 rounded-3xl border border-primary/20 shadow-inner">
                    <label className="flex items-center gap-5 cursor-pointer group p-3 hover:bg-white/60 rounded-xl transition-all">
                        <input 
                            type="checkbox" 
                            checked={profile.scholarship_holder} 
                            onChange={(e) => setProfile({...profile, scholarship_holder: e.target.checked})}
                            className="w-7 h-7 rounded-lg border-primary text-primary focus:ring-primary transition-all cursor-pointer shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="text-base font-bold group-hover:text-primary transition-colors">¿Eres becario?</span>
                            <span className="text-xs text-muted-foreground/80">Indica si cuentas con algún beneficio de beca vigente</span>
                        </div>
                    </label>
                    <label className="flex items-center gap-5 cursor-pointer group p-3 hover:bg-white/60 rounded-xl transition-all">
                        <input 
                            type="checkbox" 
                            checked={profile.tuition_fees_up_to_date} 
                            onChange={(e) => setProfile({...profile, tuition_fees_up_to_date: e.target.checked})}
                            className="w-7 h-7 rounded-lg border-primary text-primary focus:ring-primary transition-all cursor-pointer shadow-sm"
                        />
                        <div className="flex flex-col">
                            <span className="text-base font-bold group-hover:text-primary transition-colors">¿Mensualidades al día?</span>
                            <span className="text-xs text-muted-foreground/80">Confirmación de estado de cuenta con finanzas</span>
                        </div>
                    </label>
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={saving} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] rounded-2xl">
                        {saving ? 'Guardando Cambios...' : 'Actualizar Mi Seguimiento Académico'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
