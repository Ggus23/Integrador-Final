'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { AcademicRecord, AcademicSubjectGrade } from '@/lib/types';
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  CreditCard,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Save,
} from 'lucide-react';

export function AcademicProfileForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General Record
  const [record, setRecord] = useState<Partial<AcademicRecord>>({
    gpa: 0,
    enrolled_credits: 0,
    failed_classes: 0,
    scholarship_holder: false,
    tuition_fees_up_to_date: true,
  });

  // Subjects List
  const [subjects, setSubjects] = useState<Partial<AcademicSubjectGrade>[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Partial<AcademicSubjectGrade>>({
    subject_name: '',
    hito2_procesual: 0,
    hito2_nota: 0,
    hito3_procesual: 0,
    hito3_nota: 0,
    hito4_procesual: 0,
    hito4_nota: 0,
    hito5_procesual: 0,
    hito5_nota: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordData, subjectsData] = await Promise.all([
          apiClient.getMyAcademicProfile(),
          apiClient.getMySubjectGrades(),
        ]);
        if (recordData) setRecord(recordData);
        if (subjectsData) setSubjects(subjectsData);
      } catch (err) {
        console.error('Error fetching academic data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateRecord = async () => {
    setSaving(true);
    try {
      await apiClient.updateMyAcademicProfile(record);
      toast.success('Información general actualizada');
    } catch (err) {
      toast.error('Error al actualizar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!currentSubject.subject_name) {
      toast.error('Nombre de materia requerido');
      return;
    }
    setSaving(true);
    try {
      const saved = await apiClient.saveSubjectGrade(currentSubject);
      setSubjects([...subjects.filter((s) => s.subject_name !== saved.subject_name), saved]);
      setCurrentSubject({
        subject_name: '',
        hito2_procesual: 0,
        hito2_nota: 0,
        hito3_procesual: 0,
        hito3_nota: 0,
        hito4_procesual: 0,
        hito4_nota: 0,
        hito5_procesual: 0,
        hito5_nota: 0,
      });
      toast.success(`Materia ${saved.subject_name} guardada`);
    } catch (err) {
      toast.error('Error al guardar materia');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );

  return (
    <Card className="border-border relative overflow-hidden p-6 shadow-2xl md:p-10">
      {/* Header con Steps */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex gap-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        <span className="text-muted-foreground text-xs font-black tracking-widest uppercase">
          Paso {step} de 3
        </span>
      </div>

      {/* Paso 1: Información Base */}
      {step === 1 && (
        <div className="animate-fade-in space-y-8">
          <div className="space-y-2">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <GraduationCap className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-serif text-3xl font-bold">Estado Semestral</h3>
            <p className="text-muted-foreground">
              Define tu carga académica actual para el cálculo de riesgo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Materias del Semestre</Label>
              <Input
                type="number"
                value={record.enrolled_credits} // Usando el campo para 'total materias'
                onChange={(e) =>
                  setRecord({ ...record, enrolled_credits: parseInt(e.target.value) })
                }
                className="bg-muted/20 h-12"
              />
              <p className="text-muted-foreground text-[10px] leading-tight italic">
                ¿Cuántas materias estás llevando este semestre en total? Esto nos ayuda a medir tu
                carga de estudio.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Semestre Actual</Label>
              <Input type="number" placeholder="Ej. 4" className="bg-muted/20 h-12" />
            </div>
          </div>

          <Button onClick={() => setStep(2)} className="h-14 w-full text-lg font-bold">
            Siguiente: Registro de Notas <ChevronRight className="ml-2" />
          </Button>
        </div>
      )}

      {/* Paso 2: Registro de Materias y Notas */}
      {step === 2 && (
        <div className="animate-fade-in space-y-8">
          <div className="space-y-2">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-serif text-3xl font-bold">Notas por Materia</h3>
            <p className="text-muted-foreground">
              Registra el avance de tus hitos para cada materia.
            </p>
          </div>

          {/* Listado de materias ya guardadas */}
          <div className="flex flex-wrap gap-3">
            {subjects.map((s, i) => (
              <div
                key={i}
                className="bg-primary/5 border-primary/20 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
              >
                <CheckCircle2 className="text-primary h-4 w-4" /> {s.subject_name}
              </div>
            ))}
          </div>

          <Card className="bg-muted/10 space-y-6 border-dashed p-6">
            <div className="grid grid-cols-1 gap-4">
              <Label className="text-xs font-black uppercase">Nombre de la Materia</Label>
              <Input
                placeholder="Ej. Análisis Matemático"
                value={currentSubject.subject_name}
                onChange={(e) =>
                  setCurrentSubject({ ...currentSubject, subject_name: e.target.value })
                }
                className="bg-background border-primary/20 h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[2, 3, 4, 5].map((h) => (
                <div key={h} className="bg-background rounded-xl border p-4 shadow-sm">
                  <span className="text-primary mb-3 block text-[10px] font-black uppercase">
                    Hito {h}
                  </span>
                  <div className="space-y-3">
                    <Input
                      placeholder="Proc."
                      type="number"
                      value={
                        currentSubject[`hito${h}_procesual` as keyof AcademicSubjectGrade] || 0
                      }
                      onChange={(e) =>
                        setCurrentSubject({
                          ...currentSubject,
                          [`hito${h}_procesual`]: parseFloat(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Nota"
                      type="number"
                      value={currentSubject[`hito${h}_nota` as keyof AcademicSubjectGrade] || 0}
                      onChange={(e) =>
                        setCurrentSubject({
                          ...currentSubject,
                          [`hito${h}_nota`]: parseFloat(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddSubject}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 h-12 w-full font-bold"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Guardar Nota de Materia
            </Button>
          </Card>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="h-14 flex-1">
              <ChevronLeft className="mr-2" /> Atrás
            </Button>
            <Button onClick={() => setStep(3)} className="h-14 flex-[2] text-lg font-bold">
              Siguiente: Datos Financieros <ChevronRight className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Financiero y Finalizar */}
      {step === 3 && (
        <div className="animate-fade-in space-y-8">
          <div className="space-y-2">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <CreditCard className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-serif text-3xl font-bold">Estado de Cuenta</h3>
            <p className="text-muted-foreground">
              La estabilidad financiera es clave para el éxito académico.
            </p>
          </div>

          <div className="bg-primary/5 border-primary/10 grid grid-cols-1 gap-6 rounded-2xl border p-6">
            <label className="flex cursor-pointer items-center gap-4">
              <input
                type="checkbox"
                checked={record.scholarship_holder}
                onChange={(e) => setRecord({ ...record, scholarship_holder: e.target.checked })}
                className="border-primary text-primary h-6 w-6 rounded"
              />
              <span className="text-sm font-bold">Cuento con beca estudiantil</span>
            </label>
            <label className="flex cursor-pointer items-center gap-4">
              <input
                type="checkbox"
                checked={record.tuition_fees_up_to_date}
                onChange={(e) =>
                  setRecord({ ...record, tuition_fees_up_to_date: e.target.checked })
                }
                className="border-primary text-primary h-6 w-6 rounded"
              />
              <span className="text-sm font-bold">Mis mensualidades están al día</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(2)} className="h-14 flex-1">
              <ChevronLeft className="mr-2" /> Atrás
            </Button>
            <Button
              onClick={handleUpdateRecord}
              disabled={saving}
              className="bg-primary h-14 flex-[2] text-lg font-black shadow-xl"
            >
              <Save className="mr-2" /> Finalizar Registro Académico
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
