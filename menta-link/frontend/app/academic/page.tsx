'use client';

import { Layout } from '@/components/layout';
import { AcademicProfileForm } from '@/components/AcademicProfileForm';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AcademicPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio
            </Link>
            <h1 className="text-foreground font-serif text-4xl font-black tracking-tight">
              Gestión Académica
            </h1>
            <p className="text-muted-foreground text-sm">
              Registra tus notas y materias para proyectar tu éxito semestral.
            </p>
          </div>
          <div className="bg-primary/10 text-primary hidden h-16 w-16 items-center justify-center rounded-2xl md:flex">
            <GraduationCap className="h-8 w-8" />
          </div>
        </div>

        <div className="animate-slide-up">
          <AcademicProfileForm />
        </div>
      </div>
    </Layout>
  );
}
