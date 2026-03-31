'use client';

import { Layout } from '@/components/layout';
import { AppointmentRequest } from '@/components/AppointmentRequest';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
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
              Apoyo Profesional
            </h1>
            <p className="text-muted-foreground text-sm">
              Agenda una sesión con nuestro equipo de psicología.
            </p>
          </div>
          <div className="bg-support-medium/10 text-support-medium hidden h-16 w-16 items-center justify-center rounded-2xl md:flex">
            <Heart className="h-8 w-8" />
          </div>
        </div>

        <div className="animate-slide-up max-w-2xl">
          <AppointmentRequest />
        </div>
      </div>
    </Layout>
  );
}
